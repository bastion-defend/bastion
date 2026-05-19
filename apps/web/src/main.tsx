import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

// Detect wallet extension conflicts early — before React mounts.
// Multiple extensions (MetaMask, Phantom, Rabby, evmAsk, etc.) can race to
// define window.ethereum. If it's already locked as a getter-only property,
// warn rather than crash silently.
if (typeof window !== 'undefined') {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
  if (descriptor && !descriptor.writable && !descriptor.set) {
    console.warn(
      '[Bastion] window.ethereum is locked (getter-only). ' +
      'Multiple wallet extensions are conflicting. ' +
      'Consider disabling all but one EVM wallet extension. ' +
      'Solana wallet is unaffected.',
    );
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);