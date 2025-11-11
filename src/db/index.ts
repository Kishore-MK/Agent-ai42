import Database from "better-sqlite3";

const db = new Database("agent_data.db");

// Initialize tables
db.exec(`
CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_pda TEXT UNIQUE,
  public_key TEXT,
  private_key TEXT,
  owner TEXT,
  reputation_score INTEGER DEFAULT 0,
  registered_at TEXT,
  is_active INTEGER DEFAULT 1,
  total_intents INTEGER DEFAULT 0,
  successful_txns INTEGER DEFAULT 0,
  failed_txns INTEGER DEFAULT 0,
  metadata_uri TEXT
);

CREATE TABLE IF NOT EXISTS intents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intent_hash TEXT UNIQUE,
  agent_id TEXT,
  user TEXT,
  user_signature TEXT,
  max_amount INTEGER,
  merchant TEXT,
  created_at TEXT,
  expires_at TEXT,
  executed INTEGER DEFAULT 0,
  revoked INTEGER DEFAULT 0,
  execution_tx TEXT
);
`);

export default db;
