import { tool } from "@langchain/core/tools";
import z from "zod";
import { insertAgent, getAgentByPDA, updateAgentStats } from "../db/agentModel.js";
import { insertIntent, getIntentByHash, updateIntentStatus } from "../db/intentModel.js";


export const saveAgentToDBTool = tool(
    async (input: any) => {
      await insertAgent({
        agent_pda: input.agent_pda,
        public_key: input.public_key,
        private_key: input.private_key,
        owner: input.owner,
        reputation_score: input.reputation_score ?? 0,
        registered_at: input.registered_at ?? new Date().toISOString(),
        is_active: input.is_active ?? true,
        total_intents: input.total_intents ?? 0,
        successful_txns: input.successful_txns ?? 0,
        failed_txns: input.failed_txns ?? 0,
        metadata_uri: input.metadata_uri ?? "",
      });
      return { success: true, message: "Agent stored in database" };
    },
    {
      name: "save_agent_to_db",
      description: "Store or update agent details in the SQLite database",
      schema: z.object({
        agent_pda: z.string().describe("Agent Program Derived Address"),
        public_key: z.string().describe("Agent's public key"),
        private_key: z.string().describe("Agent's private key"),
        owner: z.string().describe("Owner's public key"),
        reputation_score: z.number().optional().describe("Agent reputation score (default: 0)"),
        registered_at: z.string().optional().describe("Registration timestamp (ISO string)"),
        is_active: z.boolean().optional().describe("Agent active status (default: true)"),
        total_intents: z.number().optional().describe("Total number of intents (default: 0)"),
        successful_txns: z.number().optional().describe("Successful transaction count (default: 0)"),
        failed_txns: z.number().optional().describe("Failed transaction count (default: 0)"),
        metadata_uri: z.string().optional().describe("URI for additional metadata (default: empty)"),
      }),
    }
  );
  
  export const getAgentFromDBTool = tool(
    async ({ agent_pda }: { agent_pda: string }) => {
      const result = getAgentByPDA(agent_pda);
      return result ? JSON.stringify(result) : "No agent found";
    },
    {
      name: "get_agent_from_db",
      description: "Retrieve stored agent details by PDA",
      schema: z.object({ 
        agent_pda: z.string().describe("Agent Program Derived Address to lookup")
      }),
    }
  );
  
  export const updateAgentInDBTool = tool(
    async ({ agent_pda, updates }: { agent_pda: string; updates: Record<string, any> }) => {
      await updateAgentStats(agent_pda, updates);
      return { success: true, message: "Agent updated successfully" };
    },
    {
      name: "update_agent_in_db",
      description: "Update an agent's stored details (e.g., reputation or stats)",
      schema: z.object({
        agent_pda: z.string().describe("Agent Program Derived Address"),
        updates: z.string().describe("JSON string of fields to update (e.g., '{\"reputation_score\": 10}')"),
      }),
    }
  );
  
  /* --- Intent DB Tools --- */
  export const saveIntentToDBTool = tool(
    async (input: any) => {
      await insertIntent({
        intent_hash: input.intent_hash,
        agent_id: input.agent_id,
        user: input.user,
        user_signature: input.user_signature,
        max_amount: input.max_amount,
        merchant: input.merchant,
        created_at: input.created_at ?? new Date().toISOString(),
        expires_at: input.expires_at,
        executed: input.executed ?? false,
        revoked: input.revoked ?? false,
        execution_tx: input.execution_tx ?? "",
      });
      return { success: true, message: "Intent stored in database" };
    },
    {
      name: "save_intent_to_db",
      description: "Store or update intent details in the SQLite database",
      schema: z.object({
        intent_hash: z.string().describe("Unique hash identifier for the intent"),
        agent_id: z.string().describe("Agent ID executing the intent"),
        user: z.string().describe("User's public key"),
        user_signature: z.string().describe("User's cryptographic signature"),
        max_amount: z.number().describe("Maximum amount allowed for this intent (lamports)"),
        merchant: z.string().describe("Merchant's public key or identifier"),
        created_at: z.string().optional().describe("Creation timestamp (ISO string, default: now)"),
        expires_at: z.string().describe("Expiration timestamp (ISO string)"),
        executed: z.boolean().optional().describe("Whether intent has been executed (default: false)"),
        revoked: z.boolean().optional().describe("Whether intent has been revoked (default: false)"),
        execution_tx: z.string().optional().describe("Transaction hash of execution (default: empty)"),
      }),
    }
  );
  
  export const getIntentFromDBTool = tool(
    async ({ intent_hash }: { intent_hash: string }) => {
      const result = getIntentByHash(intent_hash);
      return result ? JSON.stringify(result) : "No intent found";
    },
    {
      name: "get_intent_from_db",
      description: "Retrieve stored intent details by hash",
      schema: z.object({ 
        intent_hash: z.string().describe("Intent hash identifier to lookup")
      }),
    }
  );
  
  export const updateIntentStatusInDBTool = tool(
    async ({
      intent_hash,
      executed,
      revoked,
      execution_tx,
    }: {
      intent_hash: string;
      executed: boolean;
      revoked: boolean;
      execution_tx?: string;
    }) => {
      await updateIntentStatus(intent_hash, executed, revoked, execution_tx);
      return { success: true, message: "Intent status updated" };
    },
    {
      name: "update_intent_status_in_db",
      description: "Update an intent's execution or revocation status",
      schema: z.object({
        intent_hash: z.string().describe("Intent hash identifier"),
        executed: z.boolean().describe("Mark intent as executed"),
        revoked: z.boolean().describe("Mark intent as revoked"),
        execution_tx: z.string().optional().describe("Transaction hash of execution (optional)"),
      }),
    }
  );