import { useCallback } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseAbi, decodeEventLog, type Log } from 'viem';

const CONTRACT_ADDRESSES = {
  audit: import.meta.env.VITE_BASTION_AUDIT_ADDRESS as string,
  policy: import.meta.env.VITE_BASTION_POLICY_ADDRESS as string,
  firewall: import.meta.env.VITE_BASTION_FIREWALL_ADDRESS as string,
  registry: import.meta.env.VITE_BASTION_REGISTRY_ADDRESS as string,
  erc8004: import.meta.env.VITE_BASTION_ERC8004_ADDRESS as string,
};

const AuditAbi = parseAbi([
  'function entryCount() external view returns (uint256)',
  'function getEntry(uint256 entryId) external view returns ((address agent, address target, bytes4 selector, uint256 value, uint256 gasUsed, bool allowed, string reason, uint256 timestamp))',
  'function getAgentEntries(address agent, uint256 offset, uint256 limit) external view returns (uint256[] memory, uint256)',
  'event AuditRecorded(uint256 indexed entryId, address indexed agent, address target, bytes4 selector, uint256 value, uint256 gasUsed, bool allowed, string reason, uint256 timestamp)',
]);

const PolicyAbi = parseAbi([
  'function getPolicy(address agent) external view returns ((bytes4[] allowedSelectors, uint256 maxValue, uint256 dailyTxLimit, uint256 cooldownSeconds))',
  'function setPolicy(address agent, bytes4[] allowedSelectors, uint256 maxValue, uint256 dailyTxLimit, uint256 cooldownSeconds) external',
]);

const FirewallAbi = parseAbi([
  'function paused() external view returns (bool)',
  'function pause() external',
  'function unpause() external',
]);

export interface AuditEntryData {
  id: string;
  timestamp: number;
  decision: 'ALLOWED' | 'BLOCKED' | 'PENDING';
  account: string;
  intent: string;
  reason: string;
}

export interface PolicyData {
  maxSolPerTx: number;
  rateLimit: number;
  allowedPrograms: string[];
}

export interface StatsData {
  total: number;
  allowed: number;
  blocked: number;
}

export function useBastionEVM() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const addresses = CONTRACT_ADDRESSES;

  const fetchStats = useCallback(async (): Promise<StatsData | null> => {
    if (!isConnected || !publicClient || !addresses.audit) return null;
    try {
      const total = await publicClient.readContract({
        address: addresses.audit as `0x${string}`,
        abi: AuditAbi,
        functionName: 'entryCount',
      }) as bigint;

      const fromBlock = await publicClient.getBlockNumber() - 10000n;
      const logs = await publicClient.getLogs({
        address: addresses.audit as `0x${string}`,
        event: {
          type: 'event',
          name: 'AuditRecorded',
          inputs: [
            { indexed: true, name: 'entryId', type: 'uint256' },
            { indexed: true, name: 'agent', type: 'address' },
            { name: 'target', type: 'address' },
            { name: 'selector', type: 'bytes4' },
            { name: 'value', type: 'uint256' },
            { name: 'gasUsed', type: 'uint256' },
            { name: 'allowed', type: 'bool' },
            { name: 'reason', type: 'string' },
            { name: 'timestamp', type: 'uint256' },
          ],
        },
        fromBlock,
        toBlock: 'latest' as any,
      });

      let allowed = 0;
      let blocked = 0;
      for (const log of logs) {
        const decoded = decodeEventLog({
          abi: AuditAbi,
          data: log.data,
          topics: log.topics,
        }) as unknown as { eventName: string; args: { allowed: boolean } };
        if (decoded.eventName === 'AuditRecorded') {
          if (decoded.args.allowed) allowed++;
          else blocked++;
        }
      }

      return {
        total: Number(total),
        allowed,
        blocked,
      };
    } catch (e) {
      console.error('fetchStats EVM error:', e);
      return null;
    }
  }, [isConnected, publicClient, addresses.audit]);

  const fetchPaused = useCallback(async (): Promise<boolean | null> => {
    if (!isConnected || !publicClient || !addresses.firewall) return null;
    try {
      const paused = await publicClient.readContract({
        address: addresses.firewall as `0x${string}`,
        abi: FirewallAbi,
        functionName: 'paused',
      }) as boolean;
      return paused;
    } catch (e) {
      console.error('fetchPaused EVM error:', e);
      return null;
    }
  }, [isConnected, publicClient, addresses.firewall]);

  const fetchAuditEntries = useCallback(
    async (limit = 50): Promise<AuditEntryData[]> => {
      if (!isConnected || !publicClient || !addresses.audit) return [];
      try {
        const fromBlock = await publicClient.getBlockNumber() - 10000n;
        const allLogs = await publicClient.getLogs({
          address: addresses.audit as `0x${string}`,
          event: {
            type: 'event',
            name: 'AuditRecorded',
            inputs: [
              { indexed: true, name: 'entryId', type: 'uint256' },
              { indexed: true, name: 'agent', type: 'address' },
              { name: 'target', type: 'address' },
              { name: 'selector', type: 'bytes4' },
              { name: 'value', type: 'uint256' },
              { name: 'gasUsed', type: 'uint256' },
              { name: 'allowed', type: 'bool' },
              { name: 'reason', type: 'string' },
              { name: 'timestamp', type: 'uint256' },
            ],
          },
          fromBlock,
          toBlock: 'latest' as any,
        });

        const entries: AuditEntryData[] = allLogs.slice(-limit).reverse().map((log: Log) => {
          const decoded = decodeEventLog({
            abi: AuditAbi,
            data: log.data,
            topics: log.topics,
          }) as unknown as {
            eventName: string;
            args: {
              entryId: bigint;
              agent: string;
              target: string;
              selector: string;
              value: bigint;
              gasUsed: bigint;
              allowed: boolean;
              reason: string;
              timestamp: bigint;
            };
          };
          return {
            id: decoded.args.entryId.toString(),
            timestamp: Number(decoded.args.timestamp),
            decision: decoded.args.allowed ? 'ALLOWED' : 'BLOCKED',
            account: decoded.args.agent,
            intent: decoded.args.reason || 'No description',
            reason: decoded.args.allowed ? 'Policy passed' : decoded.args.reason || 'Policy violation',
          };
        });

        return entries;
      } catch (e) {
        console.error('fetchAuditEntries EVM error:', e);
        return [];
      }
    },
    [isConnected, publicClient, addresses.audit],
  );

  const fetchPolicy = useCallback(async (): Promise<PolicyData | null> => {
    if (!isConnected || !publicClient || !addresses.policy || !address) return null;
    try {
      const policy = await publicClient.readContract({
        address: addresses.policy as `0x${string}`,
        abi: PolicyAbi,
        functionName: 'getPolicy',
        args: [address],
      }) as [readonly `0x${string}`[], bigint, bigint, bigint];

      return {
        maxSolPerTx: Number(policy[1]),
        rateLimit: Number(policy[2]),
        allowedPrograms: policy[0].map((s: `0x${string}`) => s),
      };
    } catch (e) {
      console.error('fetchPolicy EVM error:', e);
      return null;
    }
  }, [isConnected, publicClient, addresses.policy, address]);

  const emergencyPause = useCallback(async (): Promise<string | null> => {
    if (!isConnected || !addresses.firewall) return null;
    try {
      const hash = await writeContractAsync({
        address: addresses.firewall as `0x${string}`,
        abi: FirewallAbi,
        functionName: 'pause',
      });
      return hash;
    } catch (e) {
      console.error('emergencyPause EVM error:', e);
      return null;
    }
  }, [isConnected, writeContractAsync, addresses.firewall]);

  const emergencyResume = useCallback(async (): Promise<string | null> => {
    if (!isConnected || !addresses.firewall) return null;
    try {
      const hash = await writeContractAsync({
        address: addresses.firewall as `0x${string}`,
        abi: FirewallAbi,
        functionName: 'unpause',
      });
      return hash;
    } catch (e) {
      console.error('emergencyResume EVM error:', e);
      return null;
    }
  }, [isConnected, writeContractAsync, addresses.firewall]);

  const updatePolicy = useCallback(
    async (
      allowedSelectors: string[],
      maxValue: number,
      dailyTxLimit: number,
      cooldownSeconds: number = 0,
    ): Promise<string | null> => {
      if (!isConnected || !addresses.policy) return null;
      try {
        const hash = await writeContractAsync({
          address: addresses.policy as `0x${string}`,
          abi: PolicyAbi,
          functionName: 'setPolicy',
          args: [
            address,
            allowedSelectors.map((s) => s as `0x${string}`),
            BigInt(maxValue),
            dailyTxLimit,
            cooldownSeconds,
          ],
        });
        return hash;
      } catch (e) {
        console.error('updatePolicy EVM error:', e);
        return null;
      }
    },
    [isConnected, writeContractAsync, addresses.policy, address],
  );

  return {
    fetchStats,
    fetchPaused,
    fetchAuditEntries,
    fetchPolicy,
    emergencyPause,
    emergencyResume,
    updatePolicy,
    isConnected,
    address,
  };
}
