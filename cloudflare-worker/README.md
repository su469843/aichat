AI Chat Backend on Cloudflare Workers + KV

Routes
- POST /api/auth/register    { username, password } -> { success, userId, token }
- POST /api/auth/login       { username, password } -> { success, userId, token }
- POST /api/chat             { messages: [{role, content}], sessionId?, model?, provider?, temperature? } -> { success, sessionId, reply }
- GET  /api/history/:userId  -> { success, userId, sessions: [{ sessionId, userId, messages, createdAt }] }
- DELETE /api/history/:userId -> { success, deleted }

Storage (KV)
- USERS: stores users
  - key: user:<username>
  - key: userById:<userId>
  - value: { userId, username, passwordHash, createdAt }
- HISTORY: stores sessions
  - key: history:<userId>:<sessionId>
  - value: { sessionId, userId, messages: [{ role, content, timestamp }], createdAt }

Auth
- JWT (HS256) signed with env.JWT_SECRET
- Register/login returns { success, userId, token }
- Include Authorization: Bearer <token> to access /api/chat and history routes

CORS
- Full preflight and response headers
- Configure via CORS_ORIGINS (comma-separated) or * for all

AI Providers
- Supports OpenAI-compatible chat completions and DeepSeek
- Configure via AI_PROVIDER (openai/deepseek), AI_MODEL, AI_BASE_URL, and AI_API_KEY secret

Local Dev
1) Install Wrangler: npm i -g wrangler
2) Create KV namespaces (or use existing)
   wrangler kv:namespace create USERS
   wrangler kv:namespace create HISTORY
   wrangler kv:namespace create --preview USERS
   wrangler kv:namespace create --preview HISTORY
   Update wrangler.toml ids accordingly.
3) Set secrets:
   wrangler secret put AI_API_KEY
   wrangler secret put JWT_SECRET
4) Start dev:
   wrangler dev

Notes
- Passwords are hashed using PBKDF2 (SHA-256, 100k iterations) with random salt.
- Token TTL defaults to 7 days; configure via JWT_TTL_SECONDS.
- To delete all history for a user: DELETE /api/history/<userId> with Authorization header.
