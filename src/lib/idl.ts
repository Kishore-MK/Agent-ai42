export const idl={
  "address": "9npW8cXsqP8jj4eGRDxX45pzXVGMfmYsQMmvncafrJ9N",
  "metadata": {
    "name": "ai42_agent_registry",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "execute_intent",
      "discriminator": [
        53,
        130,
        47,
        154,
        227,
        220,
        122,
        212
      ],
      "accounts": [
        {
          "name": "intent",
          "writable": true
        },
        {
          "name": "agent",
          "writable": true
        },
        {
          "name": "executor",
          "signer": true
        },
        {
          "name": "ix_sysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "merchant_proof",
          "type": {
            "defined": {
              "name": "MerchantProof"
            }
          }
        }
      ]
    },
    {
      "name": "get_agent_score",
      "discriminator": [
        169,
        101,
        125,
        84,
        65,
        177,
        57,
        40
      ],
      "accounts": [
        {
          "name": "agent"
        }
      ],
      "args": [],
      "returns": "u64"
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "record_intent",
      "discriminator": [
        50,
        227,
        41,
        124,
        202,
        96,
        159,
        213
      ],
      "accounts": [
        {
          "name": "intent",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  116,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "intent_hash"
              }
            ]
          }
        },
        {
          "name": "agent",
          "writable": true
        },
        {
          "name": "user"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "intent_hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "user_signature",
          "type": "bytes"
        },
        {
          "name": "max_amount",
          "type": "u64"
        },
        {
          "name": "merchant",
          "type": "string"
        },
        {
          "name": "expires_at",
          "type": "i64"
        }
      ]
    },
    {
      "name": "register_agent",
      "discriminator": [
        135,
        157,
        66,
        195,
        2,
        113,
        175,
        30
      ],
      "accounts": [
        {
          "name": "agent",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  103,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "agent_id"
              }
            ]
          }
        },
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "agent_id",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "public_key_jwk",
          "type": "string"
        },
        {
          "name": "metadata_uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "revoke_intent",
      "discriminator": [
        42,
        248,
        79,
        132,
        107,
        96,
        193,
        153
      ],
      "accounts": [
        {
          "name": "intent",
          "writable": true
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "update_agent_status",
      "discriminator": [
        11,
        32,
        102,
        101,
        137,
        208,
        251,
        230
      ],
      "accounts": [
        {
          "name": "agent",
          "writable": true
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "is_active",
          "type": "bool"
        }
      ]
    },
    {
      "name": "update_reputation",
      "discriminator": [
        194,
        220,
        43,
        201,
        54,
        209,
        49,
        178
      ],
      "accounts": [
        {
          "name": "agent",
          "writable": true
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "score_delta",
          "type": "i64"
        },
        {
          "name": "reason",
          "type": "string"
        }
      ]
    },
    {
      "name": "verify_intent",
      "discriminator": [
        240,
        198,
        213,
        223,
        94,
        7,
        247,
        247
      ],
      "accounts": [
        {
          "name": "intent"
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "IntentStatus"
        }
      }
    }
  ],
  "accounts": [
    {
      "name": "Agent",
      "discriminator": [
        47,
        166,
        112,
        147,
        155,
        197,
        86,
        7
      ]
    },
    {
      "name": "AgentRegistry",
      "discriminator": [
        6,
        34,
        128,
        124,
        33,
        136,
        199,
        171
      ]
    },
    {
      "name": "Intent",
      "discriminator": [
        247,
        162,
        35,
        165,
        254,
        111,
        129,
        109
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "IntentAlreadyExecuted",
      "msg": "Intent has already been executed"
    },
    {
      "code": 6001,
      "name": "IntentRevoked",
      "msg": "Intent has been revoked by user"
    },
    {
      "code": 6002,
      "name": "IntentExpired",
      "msg": "Intent has expired"
    },
    {
      "code": 6003,
      "name": "InvalidSignature",
      "msg": "Invalid signature provided"
    },
    {
      "code": 6004,
      "name": "AmountExceedsLimit",
      "msg": "Amount exceeds maximum allowed"
    },
    {
      "code": 6005,
      "name": "Unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6006,
      "name": "AgentNotActive",
      "msg": "Agent is not active"
    },
    {
      "code": 6007,
      "name": "AgentMismatch",
      "msg": "Agent ID mismatch"
    },
    {
      "code": 6008,
      "name": "InvalidMerchantProof",
      "msg": "Invalid merchant proof"
    },
    {
      "code": 6009,
      "name": "PublicKeyTooLarge",
      "msg": "Public key too large (max 1024 bytes)"
    },
    {
      "code": 6010,
      "name": "MetadataUriTooLarge",
      "msg": "Metadata URI too large (max 256 bytes)"
    },
    {
      "code": 6011,
      "name": "MerchantNameTooLarge",
      "msg": "Merchant name too large (max 256 bytes)"
    },
    {
      "code": 6012,
      "name": "ReasonTooLarge",
      "msg": "Reason too large (max 256 bytes)"
    },
    {
      "code": 6013,
      "name": "InvalidExpiry",
      "msg": "Invalid expiry timestamp"
    },
    {
      "code": 6014,
      "name": "MissingEd25519Verification",
      "msg": "Ed25519 signature verification instruction missing or invalid"
    }
  ],
  "types": [
    {
      "name": "Agent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agent_id",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "public_key_jwk",
            "type": "string"
          },
          {
            "name": "reputation_score",
            "type": "u64"
          },
          {
            "name": "registered_at",
            "type": "i64"
          },
          {
            "name": "is_active",
            "type": "bool"
          },
          {
            "name": "total_intents",
            "type": "u64"
          },
          {
            "name": "successful_txns",
            "type": "u64"
          },
          {
            "name": "failed_txns",
            "type": "u64"
          },
          {
            "name": "metadata_uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "AgentRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "total_agents",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Intent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "intent_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "agent_id",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "user_signature",
            "type": "bytes"
          },
          {
            "name": "max_amount",
            "type": "u64"
          },
          {
            "name": "merchant",
            "type": "string"
          },
          {
            "name": "created_at",
            "type": "i64"
          },
          {
            "name": "expires_at",
            "type": "i64"
          },
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "revoked",
            "type": "bool"
          },
          {
            "name": "execution_tx",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "IntentStatus",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "is_valid",
            "type": "bool"
          },
          {
            "name": "is_expired",
            "type": "bool"
          },
          {
            "name": "is_executed",
            "type": "bool"
          },
          {
            "name": "is_revoked",
            "type": "bool"
          },
          {
            "name": "max_amount",
            "type": "u64"
          },
          {
            "name": "merchant",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "MerchantProof",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "order_id",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "merchant_signature",
            "type": "bytes"
          },
          {
            "name": "merchant_public_key",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    }
  ]
}