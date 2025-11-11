import db from "./index.js";

export interface Intent {
  intent_hash: string;
  agent_id: string;
  user: string;
  user_signature: string;
  max_amount: number;
  merchant: string;
  created_at: string;
  expires_at: string;
  executed?: boolean;
  revoked?: boolean;
  execution_tx?: string;
}

export function insertIntent(intent: Intent) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO intents (
      intent_hash, agent_id, user, user_signature, max_amount,
      merchant, created_at, expires_at, executed, revoked, execution_tx
    ) VALUES (@intent_hash, @agent_id, @user, @user_signature, @max_amount,
      @merchant, @created_at, @expires_at, @executed, @revoked, @execution_tx)
  `);
  stmt.run(intent);
}

export function getIntentByHash(intent_hash: string) {
  return db.prepare("SELECT * FROM intents WHERE intent_hash = ?").get(intent_hash);
}

export function updateIntentStatus(intent_hash: string, executed: boolean, revoked: boolean, execution_tx?: string) {
  const stmt = db.prepare(`
    UPDATE intents SET executed=@executed, revoked=@revoked, execution_tx=@execution_tx WHERE intent_hash=@intent_hash
  `);
  stmt.run({ intent_hash, executed, revoked, execution_tx });
}
