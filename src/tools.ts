import { Ed25519Keys, OrderInfo, ProductDetails } from "./types.js";
import * as dotenv from "dotenv";
import z from "zod";
import {
  toolCompleteCheckout,
  toolExtractProduct,
} from "./tools/browser-tools.js";
import {
  executeIntent,
  generateIntentHash,
  getAgentScore,
  recordIntent,
  registerAgent,
  revokeIntent,
  updateReputation,
  verifyIntent,
} from "./tools/intent-registry-tools.js";
import { PublicKey } from "@solana/web3.js";
import { DynamicStructuredTool, tool } from "@langchain/core/tools";
import { getAgentFromDBTool,   saveIntentToDBTool, saveAgentToDBTool, updateAgentInDBTool, getIntentFromDBTool, updateIntentStatusInDBTool } from "./tools/databaseTools.js";
import { makeX402PaymentTool } from "./tools/x402-payment-tool.js";

dotenv.config(); 
 

export const readEnvTool = tool(
    async ({ keyword }: { keyword: string }) => {
      const envVars = process.env;
      const keywordLower = keyword.toLowerCase();
  
      const matched = Object.entries(envVars)
        .filter(([key]) => key.toLowerCase().includes(keywordLower))
        .map(([key, value]) => ({ key, value }));
  
      if (matched.length === 0) {
        return `No environment variables found related to "${keyword}".`;
      }
  
      return matched
        .map(({ key, value }) => `${key}=${value}`)
        .join("\n");
    },
    {
      name: "read_env",
      description:
        "Search and read environment variables related to a keyword. Example: keyword='solana' will return all Solana-related vars.",
      schema: z.object({
        keyword: z.string().describe("A keyword to search environment variables (e.g., 'solana', 'google', 'gemini')."),
      }),
    }
  );

const extractProductTool = tool(
  async ({ url,intentPDA }: { url: string,intentPDA:string }) => {
    console.log(url,intentPDA);
    
    return await toolExtractProduct(url,intentPDA);
  },
  {
    name: "extract_product_details",
    description:
      "Extract product details from a merchant URL using authenticated browser automation",
    schema: z.object({
      url: z.string().describe("The product URL to extract details from"), 
      intentPDA: z.string().optional().describe("The Intent PDA injected automatically")

    }),
  }
);
const completeCheckoutTool = tool(
  async ({ productUrl,intentPDA }: { productUrl: string , intentPDA:string}) => {
    console.log(productUrl,intentPDA);
    return await toolCompleteCheckout(productUrl,intentPDA);
  },
  {
    name: "complete_checkout",
    description: "Complete a purchase checkout process with TAP authentication",
    schema: z.object({
      productUrl: z.string().describe("The product page URL"),
      intentPDA: z.string().optional().describe("The Intent PDA injected automatically")
    }),
  }
);

const registerAgentTool = tool(
  async ({ agentPubKey }: { agentPubKey: string }) => {
    console.log("agentPubKey", agentPubKey);

    const pubkey = new PublicKey(agentPubKey);
    const agentId = Array.from(pubkey.toBytes());
    const agentPDA = await registerAgent(agentId);
    return {
      success: true,
      agentPDA: agentPDA.toBase58(),
      agentId: agentPubKey,
    };
  },
  {
    name: "register_agent",
    description: "Register a new agent in the Solana TAP registry",
    schema: z.object({
      agentPubKey: z.string().describe("Agent Public Key as string"),
    }),
  }
);

export const recordIntentTool = tool(
  async ({
    agentPDA,
    maxAmount,
    action,
    expiresInSeconds,
  }: {
    agentPDA: string;
    maxAmount: number;
    action: string;
    expiresInSeconds: number;
  }) => {
    const intentHash = generateIntentHash();
    const result = await recordIntent(
      new PublicKey(agentPDA),
      intentHash,
      maxAmount,
      action,
      expiresInSeconds
    );
    return {
      success: true,
      intentPDA: result.intentPDA.toBase58(),
      expiresAt: result.expiresAt,
    };
  },
  {
    name: "record_intent",
    description: "Record an action intent on Solana blockchain. Records user's intended action with amount limit and expiration time.",
    schema: z.object({
      agentPDA: z.string().describe("Agent PDA address"),
      maxAmount: z.number().describe("Maximum amount in lamports"),
      action: z.string().describe("Action name"),
      expiresInSeconds: z
        .number()
        .default(3600)
        .describe("Intent expiration time"),
    }),
  }
);
const verifyIntentTool = tool(
    async ({ intentPDA }: { intentPDA: string }) => {
      try {
        const result = await verifyIntent(new PublicKey(intentPDA));
        return JSON.stringify({
          success: true,
          result: result
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message
        });
      }
    },
    {
      name: "verify_intent",
      description: "Verify an intent on Solana blockchain. Checks if an intent is valid and active.",
      schema: z.object({
        intentPDA: z.string().describe("Intent PDA address to verify"),
      }),
    }
  );
  
  const executeIntentTool = tool(
    async ({
      actionId,
      intentPDA,
      agentPDA,
      amount,
      agentSecretKey,
      agentPublicKeyString
    }: {
      actionId: string;
      intentPDA: string;
      agentPDA: string;
      amount: number;
      agentSecretKey: string;
      agentPublicKeyString: string;
    }) => {
      try {
        await executeIntent(
          actionId,
          new PublicKey(intentPDA),
          new PublicKey(agentPDA),
          amount,
          agentSecretKey,
          new PublicKey(agentPublicKeyString)
        );
        return JSON.stringify({
          success: true,
          message: "Intent executed successfully"
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message
        });
      }
    },
    {
      name: "execute_intent",
      description: "Execute a verified intent on Solana blockchain with merchant signature proof. This performs the actual action recorded in the intent.",
      schema: z.object({
        actionId: z.string().describe("Action/Order ID"),
        intentPDA: z.string().describe("Intent PDA address"),
        agentPDA: z.string().describe("Agent PDA address"),
        amount: z.number().describe("Amount in lamports"),
        agentSecretKey: z.string().describe("Agent secret key for signing"),
        agentPublicKeyString: z.string().describe("Agent public key string"),
      }),
    }
  );
  
  const revokeIntentTool = tool(
    async ({ intentPDA }: { intentPDA: string }) => {
      try {
        await revokeIntent(new PublicKey(intentPDA));
        return JSON.stringify({
          success: true,
          message: "Intent revoked successfully"
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message
        });
      }
    },
    {
      name: "revoke_intent",
      description: "Revoke an active intent on Solana blockchain. Cancels a previously recorded intent before execution.",
      schema: z.object({
        intentPDA: z.string().describe("Intent PDA address to revoke"),
      }),
    }
  );
  
  const updateReputationTool = tool(
    async ({
      agentPDA,
      scoreDelta,
      reason
    }: {
      agentPDA: string;
      scoreDelta: number;
      reason: string;
    }) => {
      try {
        await updateReputation(
          new PublicKey(agentPDA),
          scoreDelta,
          reason
        );
        return JSON.stringify({
          success: true,
          message: `Reputation updated by ${scoreDelta}`,
          reason: reason
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message
        });
      }
    },
    {
      name: "update_reputation",
      description: "Update agent reputation score on Solana blockchain. Increases or decreases agent's reputation based on actions.",
      schema: z.object({
        agentPDA: z.string().describe("Agent PDA address"),
        scoreDelta: z.number().describe("Score change amount (positive or negative)"),
        reason: z.string().describe("Reason for reputation update"),
      }),
    }
  );
  
  const getAgentScoreTool = tool(
    async ({ agentPDA }: { agentPDA: string }) => {
      try {
        const score = await getAgentScore(new PublicKey(agentPDA));
        return JSON.stringify({
          success: true,
          score: score.toString()
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message
        });
      }
    },
    {
      name: "get_agent_score",
      description: "Get current reputation score of an agent from Solana blockchain.",
      schema: z.object({
        agentPDA: z.string().describe("Agent PDA address"),
      }),
    }
  );
  

const listToolsTool = tool(
  async () => {
    const toolList = tools
      .map((t, index) => `${index + 1}. ${t.name}: ${t.description}`)
      .join("\n");

    return `Available tools:\n${toolList}`;
  },
  {
    name: "list_tools",
    description: "Lists all available tools and their descriptions",
    schema: z.object({}),
  }
);

export const tools: DynamicStructuredTool[] = [
    extractProductTool,
    registerAgentTool,
    recordIntentTool,
    completeCheckoutTool,
    listToolsTool,
    getAgentScoreTool,
    verifyIntentTool,
    executeIntentTool,
    updateReputationTool,
    revokeIntentTool,
    readEnvTool,
    // DB Tools
    saveAgentToDBTool,
    getAgentFromDBTool,
    updateAgentInDBTool,
    saveIntentToDBTool,
    getIntentFromDBTool,
    updateIntentStatusInDBTool,
    // x402
    makeX402PaymentTool,
  ];
  