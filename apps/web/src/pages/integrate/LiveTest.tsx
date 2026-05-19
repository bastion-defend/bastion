import { useState } from 'react';
import type { ChainId } from '../../lib/chains';
import { CHAINS } from '../../lib/chains';

interface Props {
  chain: ChainId;
}

// Each chain needs a different health-check strategy:
//   Solana  — GET /health returns "ok" as plain text
//   Celo    — EVM JSON-RPC POST eth_blockNumber (getHealth is a Solana method and
//             causes forno.celo.org to return 403)
async function checkChainHealth(chain: ChainId): Promise<{ ok: boolean; detail: string }> {
  if (chain === 'solana') {
    const res = await fetch('https://api.devnet.solana.com/health', { method: 'GET' });
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
    const text = await res.text();
    // Solana returns "ok" when healthy, "behind" when lagging
    if (text.trim() === 'ok') return { ok: true, detail: 'ok' };
    return { ok: false, detail: text.trim() };
  }

  // Celo (EVM) — use eth_blockNumber
  const res = await fetch(CHAINS.celo.rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
  });
  if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
  const json = await res.json();
  if (json.error) return { ok: false, detail: json.error.message ?? 'RPC error' };
  const block = parseInt(json.result, 16);
  return { ok: true, detail: `block #${block.toLocaleString()}` };
}

export default function LiveTest({ chain }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleTest() {
    setStatus('loading');
    setMessage('');

    try {
      const { ok, detail } = await checkChainHealth(chain);
      if (ok) {
        setStatus('ok');
        setMessage(`Connected to ${CHAINS[chain].name}. RPC is healthy. (${detail})`);
      } else {
        setStatus('error');
        setMessage(`RPC check failed: ${detail}`);
      }
    } catch (err) {
      setStatus('error');
      setMessage(`Could not reach ${CHAINS[chain].name} RPC. Check your network.`);
      console.error('[Bastion] LiveTest error:', err);
    }
  }

  return (
    <section className="max-w-3xl mx-auto" aria-labelledby="test-heading">
      <h3
        id="test-heading"
        className="font-sans text-sm uppercase tracking-wider mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        Live Test
      </h3>

      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <p className="font-sans text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Verify your connection to the {CHAINS[chain].name} network before integrating.
        </p>

        <button
          onClick={handleTest}
          disabled={status === 'loading'}
          className="rounded-full px-6 py-2.5 text-sm font-medium font-sans transition-all duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:opacity-50"
          style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
        >
          {status === 'loading' ? 'Testing...' : 'Test Connection'}
        </button>

        {message && (
          <p
            className="font-sans text-sm mt-4"
            style={{ color: status === 'ok' ? '#22c55e' : '#ef4444' }}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
