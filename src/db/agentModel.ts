import db from "./index.js";

export interface Agent {
  agent_pda: string;
  public_key: string;
  private_key: string;
  owner: string;
  reputation_score?: number;
  registered_at?: string;
  is_active?: boolean;
  total_intents?: number;
  successful_txns?: number;
  failed_txns?: number;
  metadata_uri?: string;
}

export function insertAgent(agent: Agent) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO agents (
      agent_pda, public_key, private_key, owner, reputation_score,
      registered_at, is_active, total_intents, successful_txns, failed_txns, metadata_uri
    ) VALUES (@agent_pda, @public_key, @private_key, @owner, @reputation_score,
      @registered_at, @is_active, @total_intents, @successful_txns, @failed_txns, @metadata_uri)
  `);
  stmt.run(agent);
}

export function getAgentByPDA(agent_pda: string) {
  return db.prepare("SELECT * FROM agents WHERE agent_pda = ?").get(agent_pda);
}

export function updateAgentStats(agent_pda: string, updates: Partial<Agent>) {
  const fields = Object.keys(updates)
    .map((key) => `${key}=@${key}`)
    .join(", ");
  const stmt = db.prepare(`UPDATE agents SET ${fields} WHERE agent_pda=@agent_pda`);
  stmt.run({ agent_pda, ...updates });
}
