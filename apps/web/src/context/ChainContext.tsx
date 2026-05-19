import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ChainId } from '../lib/chains';
import { CHAINS, DEFAULT_CHAIN } from '../lib/chains';

interface ChainContextValue {
  chain: ChainId;
  setChain: (id: ChainId) => void;
}

const ChainContext = createContext<ChainContextValue>({
  chain: DEFAULT_CHAIN,
  setChain: () => {},
});

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [chain, setChainState] = useState<ChainId>(() => {
    const stored = localStorage.getItem('bastion-chain');
    if (stored && stored in CHAINS) return stored as ChainId;
    return DEFAULT_CHAIN;
  });

  useEffect(() => {
    localStorage.setItem('bastion-chain', chain);
  }, [chain]);

  const setChain = useCallback((id: ChainId) => {
    setChainState(id);
  }, []);

  return (
    <ChainContext.Provider value={{ chain, setChain }}>
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  return useContext(ChainContext);
}
