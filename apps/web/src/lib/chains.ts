export type ChainId = 'solana' | 'celo';

export interface ChainConfig {
  id: ChainId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  rpcUrl: string;
  explorerUrl: string;
}

export const CHAINS: Record<ChainId, ChainConfig> = {
  solana: {
    id: 'solana',
    name: 'Solana',
    shortName: 'SOL',
    icon: '◎',
    color: '#9945FF',
    rpcUrl: 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com',
  },
  celo: {
    id: 'celo',
    name: 'Celo',
    shortName: 'CELO',
    icon: '⊚',
    color: '#35D07F',
    rpcUrl: 'https://forno.celo.org',
    explorerUrl: 'https://celoscan.io',
  },
};

export const CHAIN_LIST: ChainConfig[] = Object.values(CHAINS);
export const DEFAULT_CHAIN: ChainId = 'solana';
