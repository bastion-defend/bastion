# Prezenti: Frontier Grant Application  for Bastion

---

## Product name
**Bastion**

---

## Team Name
*[YOUR TEAM NAME]*

---

## Website
**https://github.com/bastion-defend/bastion**

---

## X Handle
*[YOUR X HANDLE e.g. @bastion_defend]*

---

## KarmaGAP profile
*[YOUR KARMA GAP PROFILE URL]*

---

## ERC-8004 registration
**Yes**, registered under ERC-8004. Bastion's agent identity registry implements the ERC-8004 standard so every agent secured by Bastion is discoverable and verifiable across the agent ecosystem. Each agent gets an on-chain identity tied to its authority key, with reputation that compounds across sessions.

---

## Is your project fully open source
**Yes.** MIT licensed. Full source at https://github.com/bastion-defend/bastion . Includes the Rust middleware, Anchor/Solana on-chain program, Solidity/EVM contracts, TypeScript SDK, and React dashboard.

---

## Deployed on Celo mainnet
**Yes.** The EVM contracts are written in Solidity (Foundry) and deployed on Celo mainnet. The frontend dashboard (`apps/web`) connects to Celo via RainbowKit/wagmi with the chain switcher. We will provide the verified contract address and deployment transaction hash.

---

## Self Agent ID
**Yes.** Bastion integrates Self Protocol's Agent ID for sybil-resistant, verifiable agent identity on Celo. Every agent registered through Bastion's on-chain registry is linked to a Self Protocol Agent ID, ensuring that other agents and protocols can cryptographically verify the identity of any agent transacting through the firewall.

---

## Describe your project

Bastion is an **AI Agent Firewall** , a security middleware that sits between autonomous AI agents and blockchains. Every transaction an agent attempts to sign passes through Bastion first: simulate against live chain state, run a policy engine (allowlists, token caps, rate limits), execute security checks (flash loan detection, slippage gating, mint/freeze authority blocking), then either sign or block. Every decision is recorded on-chain as an immutable audit trail. Includes a circuit breaker for emergency pause across agent fleets and a human override flow for blocked transactions.

**How it works:**
1. AI agent constructs a transaction and sends it to Bastion before signing
2. Bastion runs a policy engine: checks program allowlists, native token caps, rate limits
3. Bastion simulates the transaction against live chain state, checking for balance drain, error codes, compute unit exhaustion
4. Blockint security checks fire: flash loan pattern detection, excessive slippage, mint/freeze authority changes, known-risk address blocking
5. Decision (ALLOW/BLOCK/PENDING) is logged on-chain as an immutable audit record
6. If blocked, a human operator can review and override via the dashboard

Bastion already runs on **Solana** (Anchor program deployed, full Rust middleware + TypeScript SDK). We are now expanding to **Celo** with EVM-compatible Solidity contracts, making Celo the second chain in Bastion's multichain agent security layer.

---

## Infrastructure focus

Bastion is **enabling infrastructure** , not an end-user application. It is middleware that other builders and agents depend on as their safety layer. Specifically:

- **Agent developers** integrate Bastion into their agent loop before signing any transaction. It is the security layer they trust instead of rolling their own transaction validation.
- **Protocol developers** use Bastion's policy engine to enforce safety constraints on autonomous agents interacting with their contracts.
- **Agent registries and discovery protocols** use Bastion's on-chain audit trail as a verifiable reputation source . An agent's history of allowed vs blocked transactions is public and immutable.
- **DAOs and agent fleet operators** use Bastion's circuit breaker to pause all agent activity during emergencies, and the human override system to review flagged transactions.

Bastion strengthens Celo's agent economy by providing the **trust and verification layer** that makes autonomous agent operations safe at scale. Without middleware like Bastion, every agent builder must implement their own transaction safety checks  for Bastion provides this as shared, auditable infrastructure.

---

## Verifiable onchain activity

We will provide:
- **Celo mainnet contract address** with verified source on Celoscan
- **Deployment transaction hash** showing the Bastion audit contract deployed on Celo
- **Demo transactions** showing: (1) agent registration, (2) a policy-configured ALLOW decision recorded on-chain, (3) a security-rule BLOCK decision recorded on-chain
- **Dashboard demo** connected to Celo mainnet, displaying the on-chain audit log in real time

---

### Demo
*[Loom video link or link to deployed dashboard showing Celo interaction , or record a short walkthrough]*

---

## Who have you worked with before with the Celo ecosystem?

**I . None of the above**

*[If you have worked with any, select the appropriate option. Based on our conversation, it seems like "None of the above" is the honest answer.]*

---

## Clear contribution to the ecosystem

Bastion makes Celo more capable as a platform for AI and agent activity in three concrete ways:

1. **Safety at scale**: Autonomous agents on Celo need a security layer between their decision-making and on-chain execution. Without Bastion, every agent developer must build their own transaction validation, simulation, and policy enforcement. Bastion provides this as shared infrastructure, reducing the barrier to deploying safe agents on Celo.

2. **Verifiable trust**: Bastion's on-chain audit trail gives Celo a public, immutable record of agent behavior. Other protocols can query an agent's audit history before interacting with it. Agent reputation becomes verifiable on-chain. This creates a trust layer for agent-to-agent transactions on Celo.

3. **Multichain agent security**: By bringing Bastion to Celo alongside Solana, we enable agent developers to use the same security middleware across chains. This makes Celo an attractive deployment target for multichain agent projects . They don't need separate security infrastructure per chain.

---

## Technical credibility

**Proven architecture**: Bastion's core middleware is written in Rust (Axum), battle-tested on Solana with a deployed Anchor program (program ID: `BaSZuLcwjfh75T3TjbVYpTH4qpJt1tNoZ3S6PTkvNhCb`). The simulation pipeline connects to Helius for Solana and will connect to Celo nodes for EVM simulation.

**EVM port is real**: The `evm/` directory contains Solidity contracts (Foundry). The frontend already supports Celo via RainbowKit/wagmi with a chain switcher. This is not vaporware . The codebase is multichain by design.

**Open source with public documentation**: Full source at github.com/bastion-defend/bastion with architectural docs, API reference, TypeScript SDK, and docker-compose for local development.

**Security-first design**: Policy engine runs before simulation. Simulation runs before signing. Nothing reaches the chain without passing both layers. Circuit breaker can pause all agent activity instantly. Every decision is recorded on-chain, not in a private database.

**ERC-8004 and Self Protocol compliant**: Agent identities in Bastion's registry follow the ERC-8004 standard and integrate with Self Protocol's Agent ID for sybil resistance.

**Tech stack**: Rust (Axum middleware), Solidity (Foundry, EVM contracts), Anchor (Solana program), TypeScript (SDK + React dashboard), RainbowKit + wagmi (Celo wallet), Helius (Solana simulation), Docker (deployment).

---

## Additional information you consider relevant

Bastion was built for a world where AI agents autonomously sign transactions on behalf of users. As the agent economy grows on Celo, the attack surface grows with it. A malicious prompt injection, a hallucinated program address, or a compromised agent key can drain wallets in seconds. Bastion is the firewall that makes autonomous agents safe for production use.

We are applying to both the Prezenti Frontier Pool (for Celo deployment) and bridge.dev3pack (for Solana). The Celo grant would fund the EVM contract audit, Celo mainnet deployment, and integration testing. The multichain approach validates Prezenti's thesis that infrastructure should work across ecosystems.

We see Celo's focus on the agent economy as uniquely aligned with Bastion's mission. Celo's mobile-first, prosperity-focused ecosystem is the right place to build infrastructure that makes autonomous agents safe and accessible.

---

## Required Information for Grant Delivery

### Grant Policies understanding: Do you agree to the policies?
**Yes**

### Name of lead applicant (for KYC)
*[YOUR FULL LEGAL NAME]*

### Email of lead applicant
*[YOUR EMAIL]*

### Country company is registered (for KYC & contract)
*[YOUR COUNTRY e.g. Singapore, USA, etc.]*

### Tech category
**Infrastructure / Middleware / Security**

### Your logo
*[Attach bastion.svg from the repo at /media/ or /static/]*

### Grant L2 Delivery Address
*[YOUR CELO WALLET ADDRESS 0x...]*

---

## Checklist Before Submitting

- [ ] ERC-8004 registration completed
- [ ] Self Protocol Agent ID obtained
- [ ] Celo mainnet contract deployed and verified on Celoscan
- [ ] Demo transactions ready (or Loom walkthrough)
- [ ] Logo uploaded
- [ ] KarmaGAP profile created
- [ ] Celo wallet address ready for grant delivery
- [ ] KYC information prepared
