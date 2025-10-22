# Cloudflare Worker AI Chat Backend

This Cloudflare Worker powers the AI chat backend. It accepts conversation history from the client, forwards the request to an AI provider (DeepSeek is used by default), and returns the assistant's response. The worker is intentionally simple and focuses on the chat functionality—other features such as KV storage or authentication can be added separately.

## Features
- Single endpoint `POST /api/chat` to forward chat messages to AI APIs
- Works with DeepSeek out of the box
- Supports any OpenAI-compatible API by configuring `AI_BASE_URL`
- Full CORS support for browser-based clients
- Health check endpoint at `GET /health`

## Deployment

1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/):

```bash
npm install -g wrangler
```

2. Navigate to the `cloudflare-worker` directory:

```bash
cd cloudflare-worker
```

3. Configure environment variables:
   - Set `AI_API_KEY` using Wrangler secrets or the Cloudflare dashboard:

```bash
wrangler secret put AI_API_KEY
```

   - Optional variables:
     - `AI_PROVIDER`: Defaults to `deepseek`. Use `openai` or `custom` for other providers.
     - `AI_MODEL`: Defaults to `deepseek-chat`. Specify your desired model.
     - `AI_BASE_URL`: Required when using a custom OpenAI-compatible provider.

4. Deploy the worker:

```bash
wrangler deploy
```

## API Usage

### Chat Endpoint
`POST /api/chat`

**Request Body:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "provider": "deepseek",
  "model": "deepseek-chat",
  "baseURL": "https://api.deepseek.com/v1",
  "apiKey": "optional API key override"
}
```

- `messages` (required): Array of chat messages in OpenAI format.
- `provider` (optional): Defaults to `deepseek`. Use `openai` or `custom` when needed.
- `model` (optional): Model name. Defaults to `deepseek-chat`.
- `baseURL` (optional): Required for custom providers.
- `apiKey` (optional): Overrides the configured API key in the environment.

**Response:**
```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Hello! How can I assist you today?"
  },
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 7,
    "total_tokens": 19
  },
  "model": "deepseek-chat",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Health Endpoint
`GET /health`

Returns the worker status and timestamp.

## Notes
- The worker focuses on the chat functionality. User authentication, session management, and KV persistence should be built externally if needed.
- Ensure you comply with the terms of service for the AI provider you integrate with.
