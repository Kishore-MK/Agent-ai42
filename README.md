# AI42 Agent - Trusted Agent Protocol Implementation

## Overview

AI42 Agent is a production-ready autonomous AI agent system implementing Visa's Trusted Agent Protocol (TAP) framework on Solana blockchain.
The agent provides cryptographically-verified autonomous commerce capabilities with full audit trails, user intent recording, and reputation-based trust mechanisms.

## Architecture

### Core Components

**Agent Runtime**: LangGraph-based conversational agent using Google's Gemini 2.5 Flash model with custom tool orchestration and automatic intent recording middleware.

**Intent Registry**: Solana on-chain program for recording, verifying, and executing user intents with Ed25519 signature verification and merchant proof validation.

**Tool System**: Extensible tool framework including browser automation (Playwright), blockchain operations, database persistence (SQLite), and X402 payment protocol support.

**Authentication Layer**: Ed25519 cryptographic signature system for agent authentication with merchants and user authorization verification.

**Memory System**: LangGraph MemorySaver with SQLite persistence for conversation history and intent tracking across sessions.

## Trusted Agent Protocol (TAP) Implementation

### Intent Declaration

Before any agent action, user intent is recorded on Solana blockchain with:
- Agent PDA (Program Derived Address)
- Maximum amount authorization (lamports)
- Action name and description
- Expiration timestamp
- User signature verification

### Cryptographic Verification

**User Authorization**: Ed25519 signatures verify user consent for each intent with hash-based intent verification.

**Merchant Attestation**: Merchants provide cryptographic proof containing order ID, amount, timestamp, and Ed25519 signature verified on-chain via Ed25519Program instruction.

**Agent Identity**: Agents registered on-chain with public key JWK and metadata URI for verifiable identity.

### Execution Flow

![](./assets/ai42-commerce.png)

1. User requests action via conversational interface
2. Agent middleware automatically records intent on Solana blockchain
3. Intent PDA generated and stored in SQLite database
4. Tool executes with intent PDA injected as parameter
5. Merchant validates intent signature via X402 headers
6. Action completes with merchant proof signature
7. Intent executed on-chain with Ed25519 verification
8. Reputation updated based on success/failure

### Revocability and Expiration

Intents can be revoked by users before execution. 
All intents have expiration timestamps (default 3600 seconds) enforced on-chain. 
Expired intents automatically become invalid.

## Tool Ecosystem

### Blockchain Tools

**register_agent**: Register new agent in Solana TAP registry with Ed25519 public key and metadata URI.

**record_intent**: Record user authorization intent on-chain with amount limits and expiration time.

**verify_intent**: Verify intent validity, expiration status, and user signature on-chain.

**execute_intent**: Execute verified intent with merchant proof validation via Ed25519Program instruction.

**revoke_intent**: Cancel active intent before execution, requires user signature.

**update_reputation**: Modify agent reputation score on-chain with reason string.

**get_agent_score**: Query current agent reputation score from blockchain.

### Browser Automation Tools

**extract_product_details**: Scrape product information using Playwright with Ed25519 authenticated headers and intent PDA verification.

**complete_checkout**: Execute full checkout flow with cart addition, form filling, and payment submission using cryptographic authentication.

### Database Tools

**save_agent_to_db**: Persist agent registration data (PDA, public key, metadata) to SQLite.

**get_agent_from_db**: Retrieve agent information by PDA or public key.

**update_agent_in_db**: Modify agent status, reputation, or metadata.

**save_intent_to_db**: Store intent records with PDA, hash, expiration, and action details.

**get_intent_from_db**: Query intent by PDA or hash.

**update_intent_status_in_db**: Mark intent as executed, revoked, or expired.

### Utility Tools

**list_tools**: Display all available tools with descriptions for agent self-awareness.

**read_env**: Search and retrieve environment variables by keyword for configuration access.

**make_x402_payment**: Execute HTTP 402 payment-required requests with automatic payment handling via x402-fetch library.

## Cryptographic Primitives

### Ed25519 Signature Generation

Signatures created using TweetNaCl library with Base58 encoding for Solana compatibility. 
Signature base includes HTTP Signature standard format with `@authority`, `@path`, and `@signature-params` components. 
Parameters include created timestamp, expiration, key ID, algorithm (ed25519), nonce (UUID), and tag for context identification.

### Signature Verification

On-chain verification via Solana's Ed25519Program instruction. 
Signature base reconstructed from authority, path, and parameters. 
Public key decoded from Base58 and verified against signature. Merchant proofs include order ID, amount, timestamp concatenated and signed.

### Intent Hash Generation

Random 32-byte hash generated via `nacl.randomBytes(32)` for unique intent identification.
Hash used as seed for PDA derivation: `["intent", intentHash]`. 
User signs intent hash for authorization verification stored on-chain.

## X402 Payment Protocol Integration

### Payment Flow

Agent makes request to merchant endpoint. 
Merchant returns 402 Payment Required with payment details in `x-payment-response` header (Base64-encoded JSON). 
x402-fetch library automatically handles payment via configured signer. Payment signature included in retry request. 
Merchant validates payment and processes request.

### Payment Client

`ServerPaymentClient` wraps native fetch with payment capabilities. 
Creates Ed25519 signer from private key for payment authorization. 
Extracts payment info from response headers: amount, recipient, signature, wallet. Handles payment failures with error context.

### Header Format

`x-payment-response` contains Base64-encoded JSON with payment details. 
Payment signature created using Ed25519 private key. Signature included in `Authorization` header for merchant verification.

## Database Schema

### Agents Table

Fields: id (primary key), agent_pda (unique), public_key, agent_id (byte array), metadata_uri, reputation_score, is_active, created_at, updated_at.

### Intents Table

Fields: id (primary key), intent_pda (unique), intent_hash (bytes), agent_pda (foreign key), user_pubkey, max_amount (lamports), action (string), expires_at (timestamp), status (pending/executed/revoked/expired), created_at, executed_at.

### Indexes

`idx_agent_pda` on agents.agent_pda for PDA lookups. `idx_intent_pda` on intents.intent_pda for intent queries. 
`idx_intent_status` on intents.status for filtering active intents. `idx_agent_intents` on intents.agent_pda for agent intent history.

## Agent Workflow

### Initialization

Load environment variables (Solana keypair, Ed25519 keys, Gemini API key). 
Initialize Solana connection and Anchor program. Create LangGraph StateGraph with agent node, tools node, and conditional edges. 
Compile graph with MemorySaver checkpointer. Start readline interface for console interaction.

### Conversation Loop

User inputs message via prompts library. Message added to conversation history with thread_id for memory. 
Agent invokes LangGraph workflow with user message and context. Workflow routes through agent node (model inference) and tools node (intent recording + execution). Response formatted with boxen and chalk for visual presentation. 
Loop continues until user types "exit" or "quit".

### Intent Middleware

`callToolsWithIntent` intercepts all tool calls from model. 
For each tool call, automatically invoke `record_intent` with agent PDA, max amount, action name, and expiration. 
Blockchain transaction creates intent PDA and stores on-chain. 
Intent PDA injected into original tool arguments as `intentPDA` parameter. 
Tool executes with intent context for merchant verification. Tool response returned to agent for next reasoning step.

## Security Model

### User Authorization

All intents require user signature verification on-chain. 
User must sign intent hash with private key before recording. 
Signature verified in `record_intent` instruction against user public key. 
Only intent creator can revoke intent via signature check.

### Agent Identity

Agents registered with unique Ed25519 public key stored on-chain.
Agent PDA derived from agent ID byte array for deterministic addressing. 
Public key JWK format stored in agent account for verification. Metadata URI provides additional agent information and policies.

### Merchant Validation

Merchants verify intent signatures in HTTP headers before processing. 
Intent PDA passed in `intentsignature` header for lookup. Ed25519 signature in `Signature` header validates agent identity. 
Merchant creates proof with order details and signature for on-chain execution. 
Ed25519Program instruction verifies merchant signature before intent execution.

### Reputation System

On-chain reputation scores track agent trustworthiness. 
Registry authority can update scores with delta and reason. 
Negative deltas for failed actions, positive for successful completions. 
Scores queryable by any party for trust assessment. Reputation influences agent selection and authorization limits.

## Environment Configuration

### Required Variables

`SOLANA_RPC_URL`: Solana cluster RPC endpoint (mainnet-beta, devnet, or localhost).

`SOLANA_WALLET_SECRET`: User wallet private key in Base58 format for transaction signing.

`ED25519_PRIVATE_KEY`: Agent Ed25519 private key (64 bytes) in Base58 for signature generation.

`ED25519_PUBLIC_KEY`: Agent Ed25519 public key in Base58 for verification.

`GOOGLE_API_KEY`: Google Gemini API key for model inference.

`AGENT_PDA`: Registered agent PDA address on Solana (optional, can register via tool).

### Optional Variables

`DATABASE_PATH`: SQLite database file path (default: ./agent.db).

`INTENT_EXPIRATION`: Default intent expiration in seconds (default: 3600).

`MAX_AMOUNT_LAMPORTS`: Default maximum amount authorization (default: 1000000).

`COMPUTE_UNIT_LIMIT`: Solana compute unit limit for transactions (default: 200000).

## Installation and Setup

### Prerequisites

Node.js 20+ with ES modules support. Solana CLI tools for wallet generation and program deployment. 
Anchor framework 0.32+ for Solana program interaction. 
SQLite3 for database persistence. 
Playwright browsers installed via `npx playwright install`.

### Installation Steps

Clone repository and install dependencies via `npm install`. 
Generate Solana wallet: `solana-keygen new -o wallet.json`. Generate Ed25519 keypair for agent authentication. 
Deploy TAP registry program to Solana cluster. 
Create `.env` file with required variables. 
Initialize database schema via migration scripts. Register agent on-chain using `register_agent` tool or direct program call.

### Running the Agent

Development mode: `npm run dev` for auto-reload with tsx.
Build: `npm run build` compiles TypeScript to JavaScript.
Production: `npm start` runs compiled code.
Console interface starts with welcome banner and prompt.
Type messages to interact with agent, agent responds with tool execution and intent verification.

## Usage Examples

### Product Purchase Flow

User: "buy this product http://localhost:3001/product/1"

Agent records intent on blockchain with product URL action. 
Intent PDA: `ABC123...` generated and stored. 
Agent extracts product details using Playwright with authenticated headers. 
Product found: "Wireless Headphones - $299". 
Agent adds to cart and navigates to checkout. 
Completes checkout with intent PDA in headers. 
Merchant validates intent signature and processes order. 
Order ID: `ORD-789` returned with merchant signature. 
Agent executes intent on-chain with merchant proof. 
Intent marked as executed in database. 
Reputation updated: +10 points for successful purchase.


### Intent Verification

User: "verify my last intent"

Agent queries database for most recent intent PDA. 
Calls `verify_intent` tool with intent PDA. 
On-chain verification checks expiration, user signature, and status. 
Returns: "Intent valid, expires in 2847 seconds, status: pending". 
Agent reports verification result to user.


### Agent Registration

User: "register a new agent with pubkey XYZ123..."

Agent calls `register_agent` tool with provided public key.
Creates agent ID byte array from public key.
Derives agent PDA from program address and agent ID.
Records agent on blockchain with JWK and metadata URI.
Stores agent in database with initial reputation score 0.
Returns agent PDA: `DEF456...` for future use.

### Reputation Query

User: "what's my agent's reputation score?"

Agent retrieves agent PDA from environment or database.
Calls `get_agent_score` tool with agent PDA.
On-chain view instruction returns current score.
Agent responds: "Your reputation score is 150 points based on 15 successful transactions".

## API Reference

### recordIntent(agentPDA, intentHash, maxAmount, action, expiresInSeconds)

Records user intent on Solana blockchain.
Parameters: agentPDA (PublicKey) of registered agent, intentHash (number[]) 32-byte random hash, maxAmount (number) in lamports, action (string) description, expiresInSeconds (number) validity duration.
Returns: intentPDA (PublicKey) and expiresAt (number) timestamp.
Requires user signature verification.
Creates intent account with PDA derivation from hash.

### verifyIntent(intentPDA)

Verifies intent validity on-chain.
Parameters: intentPDA (PublicKey) of intent to verify.
Returns: boolean indicating validity, expiration status, and user signature verification result.
View instruction, no transaction required.
Checks current timestamp against expiration.
Validates user signature matches stored value.

### executeIntent(actionId, intentPDA, agentPDA, amount, agentSecretKey, agentPublicKey)

Executes verified intent with merchant proof.
Parameters: actionId (string) order identifier, intentPDA (PublicKey), agentPDA (PublicKey), amount (number) in lamports, agentSecretKey (string) Base58, agentPublicKey (PublicKey).
Creates Ed25519 signature from order details.
Builds merchant proof struct with signature.
Executes on-chain with Ed25519Program pre-instruction.
Marks intent as executed.
Updates reputation on success.

### revokeIntent(intentPDA)

Revokes active intent before execution.
Parameters: intentPDA (PublicKey) of intent to revoke.
Requires user signature matching intent creator.
Updates intent status to revoked on-chain.
Prevents future execution.
No refund mechanism as no payment occurred.

### updateReputation(agentPDA, scoreDelta, reason)

Modifies agent reputation score.
Parameters: agentPDA (PublicKey), scoreDelta (number) positive or negative change, reason (string) explanation.
Requires registry authority signature.
Updates reputation in agent account.
Records reason in transaction logs.
Enforces minimum score of 0.

### getAgentScore(agentPDA)

Queries agent reputation score.
Parameters: agentPDA (PublicKey).
Returns: BN number representing current score.
View instruction, no transaction cost.
Public data accessible by anyone.
Used for trust decisions by merchants and users.

## Error Handling

### Transaction Failures

Insufficient SOL for transaction fees: Agent reports balance requirement and suggests funding.
Signature verification failure: Intent hash mismatch or invalid user signature, agent requests re-authorization.
Expired intent: Agent detects expiration and prompts for new intent recording.
Network errors: Retries with exponential backoff, reports RPC endpoint issues.

### Tool Execution Errors

Browser automation failures: Playwright timeouts or element not found, agent retries or requests manual intervention.
Database errors: Connection failures or constraint violations, logged with context and operation rolled back.
Payment failures: X402 payment declined or insufficient funds, agent reports payment details and suggests alternatives.
Invalid parameters: Schema validation errors caught by Zod, agent requests correct format with examples.

### Intent Recording Errors

Agent not registered: PDA derivation fails or agent account not found, prompts agent registration first.
Invalid signatures: Ed25519 signature verification fails, checks key format and message construction.
Duplicate intents: Intent hash collision detected, regenerates hash and retries.
Program errors: Anchor errors from on-chain program, logs full error details with instruction data.

## Performance Considerations

### Blockchain Transactions

Intent recording requires 1 transaction with ~5000 lamports fee.
Intent execution requires 1 transaction with compute budget 200k units.
Parallel intent recording supported for batch operations.
Transaction confirmation time depends on cluster congestion (typically 400-600ms on devnet).

### Database Operations

SQLite queries optimized with indexes on PDA and status fields.
Batch inserts used for multiple intent records.
Connection pooling prevents database lock contention.
Vacuum operations scheduled for database maintenance.

### Browser Automation

Playwright instances reused across tool calls to avoid startup overhead.
Headless mode reduces resource consumption.
Request interception caches static assets.
Parallel page operations for multiple product scrapes.

### Memory Management

LangGraph checkpointer stores conversation state in memory with SQLite persistence.
Message history trimmed after 50 messages to prevent context overflow.
Tool results cached for duplicate requests within session.
Agent state reset on explicit user command or session timeout.

## Deployment

### Local Development

Run Solana test validator: `solana-test-validator`. 
Deploy TAP registry program with Anchor: `anchor deploy`. 
Fund wallet with test SOL: `solana airdrop 2`. 
Start agent in development mode: `npm run dev`. 
Test merchant server on localhost:3001 for checkout flows.

### Production Deployment

Deploy agent to VPS or cloud instance with Node.js runtime. 
Use PM2 or systemd for process management and auto-restart. 
Configure Solana mainnet-beta RPC endpoint with rate limits. Secure environment variables with secrets management (e.g., AWS Secrets Manager). 
Enable HTTPS for webhook endpoints if exposing agent API. 
Monitor transaction failures and reputation changes via logging. 
Set up database backups with scheduled snapshots. 
Implement rate limiting for API endpoints to prevent abuse.

### Mainnet Considerations

Fund production wallet with sufficient SOL for transaction fees. 
Register agent on mainnet TAP registry with verified identity.
 Use priority fees for faster transaction confirmation during congestion. 
 Implement transaction retry logic with exponential backoff. 
 Monitor agent reputation score and investigate negative deltas. 
 Validate merchant signatures rigorously before executing intents. 
 Enable transaction simulation before submission to catch errors.

## Testing

### Unit Tests

Test intent hash generation uniqueness and format. Verify Ed25519 signature creation and verification. Validate PDA derivation matches expected addresses. Test tool parameter parsing and schema validation. Mock Solana program calls for isolated testing.

### Integration Tests

Test full intent recording and execution flow on localnet. Verify browser automation with test merchant endpoints. Test database persistence across agent restarts. Validate X402 payment flow with mock payment server. Test multi-tool workflows with intent injection.

### End-to-End Tests

Simulate complete purchase flow from user message to order confirmation. Test intent expiration and revocation scenarios. Verify reputation updates after successful and failed actions. Test concurrent intent executions with race conditions. Validate error recovery and retry mechanisms.

## Contributing

Fork repository and create feature branch. Follow TypeScript strict mode and ESLint rules. Add unit tests for new tools or utilities. Update README with new tool descriptions and usage examples. Test on localnet before submitting pull request. Include example .env.example for new environment variables.

## License

MIT License - see LICENSE file for details.

## Support

GitHub Issues: Report bugs and feature requests at repository issues page. Documentation: Full API reference and guides at docs.ai42.xyz. Discord Community: Join AI42 Discord for discussions and support. Email: Contact team@ai42.xyz for enterprise inquiries.