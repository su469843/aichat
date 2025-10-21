// Cloudflare Worker - AI Chat Backend with KV, Auth, History, and CORS
// Routes:
// - POST   /api/auth/register  { username, password } -> { success, userId, token }
// - POST   /api/auth/login     { username, password } -> { success, userId, token }
// - POST   /api/chat           { messages: [{role, content}], sessionId?, model?, provider?, temperature? } -> { success, sessionId, reply, messages? }
// - GET    /api/history/:userId -> list of sessions for the user
// - DELETE /api/history/:userId -> delete all sessions for the user

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    try {
      const { pathname } = url;

      // Auth routes
      if (request.method === 'POST' && pathname === '/api/auth/register') {
        return withCORS(await registerHandler(request, env), request, env);
      }
      if (request.method === 'POST' && pathname === '/api/auth/login') {
        return withCORS(await loginHandler(request, env), request, env);
      }

      // Chat
      if (request.method === 'POST' && pathname === '/api/chat') {
        return withCORS(await chatHandler(request, env), request, env);
      }

      // History
      const historyUserMatch = pathname.match(/^\/api\/history\/([^/]+)$/);
      if (historyUserMatch) {
        const userId = decodeURIComponent(historyUserMatch[1]);
        if (request.method === 'GET') {
          return withCORS(await listHistoryHandler(request, env, userId), request, env);
        }
        if (request.method === 'DELETE') {
          return withCORS(await deleteHistoryHandler(request, env, userId), request, env);
        }
      }

      return withCORS(json({ error: 'Not Found' }, 404), request, env);
    } catch (err) {
      console.error('Unhandled error', err);
      return withCORS(json({ error: 'Internal Server Error' }, 500), request, env);
    }
  }
};

// ---------- Handlers ----------

async function registerHandler(request, env) {
  const body = await safeJson(request);
  const username = (body?.username || '').trim();
  const password = body?.password || '';

  if (!username || !password) {
    return json({ error: 'username and password are required' }, 400);
  }
  if (username.length < 3 || username.length > 64) {
    return json({ error: 'username must be 3-64 chars' }, 400);
  }
  if (password.length < 6 || password.length > 128) {
    return json({ error: 'password must be 6-128 chars' }, 400);
  }

  const existing = await env.USERS.get(userKeyByUsername(username), { type: 'json' });
  if (existing) {
    return json({ error: 'username already exists' }, 409);
  }

  const userId = crypto.randomUUID();
  const { saltB64, hashB64, iterations } = await hashPassword(password);
  const now = new Date().toISOString();

  const user = {
    userId,
    username,
    passwordHash: `pbkdf2$${iterations}$${saltB64}$${hashB64}`,
    createdAt: now
  };

  // Store by username for login
  await env.USERS.put(userKeyByUsername(username), JSON.stringify(user));
  // Also store by id for lookups if needed
  await env.USERS.put(userKeyById(userId), JSON.stringify(user));

  const token = await signJWT(
    { sub: userId, username },
    env.JWT_SECRET,
    // default 7 days
    Number(env.JWT_TTL_SECONDS || 60 * 60 * 24 * 7)
  );

  return json({ success: true, userId, token });
}

async function loginHandler(request, env) {
  const body = await safeJson(request);
  const username = (body?.username || '').trim();
  const password = body?.password || '';

  if (!username || !password) {
    return json({ error: 'username and password are required' }, 400);
  }

  const user = await env.USERS.get(userKeyByUsername(username), { type: 'json' });
  if (!user) {
    return json({ error: 'invalid credentials' }, 401);
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return json({ error: 'invalid credentials' }, 401);
  }

  const token = await signJWT(
    { sub: user.userId, username: user.username },
    env.JWT_SECRET,
    Number(env.JWT_TTL_SECONDS || 60 * 60 * 24 * 7)
  );

  return json({ success: true, userId: user.userId, token });
}

async function chatHandler(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.res;

  const body = await safeJson(request);
  const sessionId = body?.sessionId || crypto.randomUUID();
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const provider = (body?.provider || env.AI_PROVIDER || 'openai').toLowerCase();
  const model = body?.model || env.AI_MODEL || (provider === 'deepseek' ? 'deepseek-chat' : 'gpt-3.5-turbo');
  const temperature = typeof body?.temperature === 'number' ? body.temperature : 0.7;

  if (!messages.length) {
    return json({ error: 'messages array is required' }, 400);
  }

  // Persist existing session if any
  const key = historyKey(auth.userId, sessionId);
  let session = await env.HISTORY.get(key, { type: 'json' });
  if (!session) {
    session = { sessionId, userId: auth.userId, messages: [], createdAt: new Date().toISOString() };
  }

  // Append new user messages
  const now = Date.now();
  const normalized = messages.map(m => ({
    role: m?.role === 'system' ? 'system' : m?.role === 'assistant' ? 'assistant' : 'user',
    content: String(m?.content ?? ''),
    timestamp: typeof m?.timestamp === 'number' ? m.timestamp : now
  }));
  session.messages.push(...normalized);

  // Call AI
  const aiResp = await callAI({ env, provider, model, messages: session.messages, temperature });
  if (!aiResp.ok) {
    return json({ error: aiResp.error || 'AI provider error' }, aiResp.status || 502);
  }

  // Append assistant message and save
  const assistantMsg = { role: 'assistant', content: aiResp.reply, timestamp: Date.now() };
  session.messages.push(assistantMsg);
  await env.HISTORY.put(key, JSON.stringify(session));

  return json({ success: true, sessionId, reply: aiResp.reply });
}

async function listHistoryHandler(request, env, userIdParam) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.res;
  if (auth.userId !== userIdParam) {
    return json({ error: 'forbidden' }, 403);
  }

  const prefix = `history:${userIdParam}:`;
  const list = await env.HISTORY.list({ prefix });
  const sessions = await Promise.all(
    list.keys.map(k => env.HISTORY.get(k.name, { type: 'json' }))
  );

  // Filter any nulls (unlikely) and sort by createdAt desc
  const result = sessions
    .filter(Boolean)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return json({ success: true, userId: userIdParam, sessions: result });
}

async function deleteHistoryHandler(request, env, userIdParam) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.res;
  if (auth.userId !== userIdParam) {
    return json({ error: 'forbidden' }, 403);
  }

  const prefix = `history:${userIdParam}:`;
  const list = await env.HISTORY.list({ prefix });
  let deleted = 0;
  await Promise.all(
    list.keys.map(async k => {
      await env.HISTORY.delete(k.name);
      deleted += 1;
    })
  );

  return json({ success: true, deleted });
}

// ---------- AI Provider ----------

async function callAI({ env, provider, model, messages, temperature = 0.7 }) {
  const apiKey = env.AI_API_KEY;
  if (!apiKey) return { ok: false, status: 500, error: 'Missing AI_API_KEY in env' };

  const base = env.AI_BASE_URL || (provider === 'deepseek' ? 'https://api.deepseek.com' : 'https://api.openai.com/v1');
  const endpoint = provider === 'deepseek' ? `${base}/v1/chat/completions` : `${base}/chat/completions`;

  // Normalize messages to OpenAI format
  const normalized = messages.map(m => ({ role: m.role, content: m.content }));

  const body = JSON.stringify({
    model,
    messages: normalized,
    temperature,
    stream: false
  });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body
  });

  if (!res.ok) {
    const text = await safeText(res);
    return { ok: false, status: res.status, error: text || 'AI provider error' };
  }

  const data = await res.json().catch(() => ({}));
  const reply = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? '';
  return { ok: true, reply };
}

// ---------- Auth (JWT HS256) ----------

async function requireAuth(request, env) {
  const authz = request.headers.get('Authorization') || '';
  const m = authz.match(/Bearer\s+(.*)/i);
  const token = m?.[1];
  if (!token) return { ok: false, res: json({ error: 'unauthorized' }, 401) };

  try {
    const payload = await verifyJWT(token, env.JWT_SECRET);
    return { ok: true, userId: payload.sub, username: payload.username };
  } catch (e) {
    return { ok: false, res: json({ error: 'unauthorized' }, 401) };
  }
}

function userKeyByUsername(username) {
  return `user:${username.toLowerCase()}`;
}
function userKeyById(userId) {
  return `userById:${userId}`;
}
function historyKey(userId, sessionId) {
  return `history:${userId}:${sessionId}`;
}

// ---------- Password hashing (PBKDF2) ----------

async function hashPassword(password, iterations = 100000) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    256
  );

  const hashB64 = toBase64Url(new Uint8Array(bits));
  const saltB64 = toBase64Url(salt);
  return { hashB64, saltB64, iterations };
}

async function verifyPassword(password, encoded) {
  try {
    const [scheme, itersStr, saltB64, hashB64] = String(encoded).split('$');
    if (scheme !== 'pbkdf2') return false;
    const iterations = Number(itersStr);
    const salt = fromBase64Url(saltB64);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
      keyMaterial,
      256
    );
    const computed = toBase64Url(new Uint8Array(bits));
    return timingSafeEqual(computed, hashB64);
  } catch {
    return false;
  }
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

// ---------- JWT (HS256) ----------

function encodeBase64Url(data) {
  let str = '';
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  // Base64
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  // URL-safe
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function toBase64Url(bytes) {
  return encodeBase64Url(bytes);
}

function fromBase64Url(str) {
  // Pad
  const pad = str.length % 4 === 2 ? '==' : str.length % 4 === 3 ? '=' : '';
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function signJWT(payload, secret, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { iat: now, exp: now + expiresInSeconds, ...payload };

  const encHeader = encodeBase64Url(JSON.stringify(header));
  const encPayload = encodeBase64Url(JSON.stringify(fullPayload));
  const data = `${encHeader}.${encPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
  const encSig = toBase64Url(sig);
  return `${data}.${encSig}`;
}

async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('bad token');
  const [encHeader, encPayload, encSig] = parts;
  const data = `${encHeader}.${encPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const sigBytes = fromBase64Url(encSig);
  const ok = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
  if (!ok) throw new Error('bad sig');

  const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encPayload)));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error('expired');
  return payload;
}

// ---------- CORS Utilities ----------

function getCorsHeaders(request, env) {
  const reqOrigin = request.headers.get('Origin') || '';
  const allowed = (env.CORS_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
  const allowAll = allowed.includes('*');
  const allowOrigin = allowAll ? '*' : (allowed.includes(reqOrigin) ? reqOrigin : allowed[0] || '*');

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Id',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function withCORS(res, request, env) {
  const headers = new Headers(res.headers);
  const cors = getCorsHeaders(request, env);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}

function handleOptions(request, env) {
  // Preflight request
  const cors = getCorsHeaders(request, env);
  return new Response(null, { status: 204, headers: cors });
}

// ---------- Helpers ----------

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
