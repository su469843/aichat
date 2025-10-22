/**
 * Cloudflare Worker for AI Chat Backend
 * Simple chat endpoint that forwards messages to AI APIs (e.g., DeepSeek)
 */

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Helper to create JSON responses with CORS
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Handle OPTIONS requests for CORS preflight
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Call DeepSeek AI API
async function callDeepSeekAPI(messages, apiKey, model = 'deepseek-chat') {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

// Call OpenAI-compatible API (works with many providers)
async function callOpenAICompatibleAPI(messages, apiKey, baseURL, model) {
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

// Main chat handler
async function handleChat(request, env) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.messages || !Array.isArray(body.messages)) {
      return jsonResponse({ error: 'messages array is required' }, 400);
    }

    if (body.messages.length === 0) {
      return jsonResponse({ error: 'messages array cannot be empty' }, 400);
    }

    // Validate message format
    for (const msg of body.messages) {
      if (!msg.role || !msg.content) {
        return jsonResponse({ error: 'Each message must have role and content' }, 400);
      }
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        return jsonResponse({ error: 'Invalid message role. Must be system, user, or assistant' }, 400);
      }
    }

    // Get API configuration from request or environment
    const apiKey = body.apiKey || env.AI_API_KEY;
    const apiProvider = body.provider || env.AI_PROVIDER || 'deepseek';
    const model = body.model || env.AI_MODEL || 'deepseek-chat';
    const baseURL = body.baseURL || env.AI_BASE_URL;

    if (!apiKey) {
      return jsonResponse({ 
        error: 'API key is required. Provide it in request body or set AI_API_KEY environment variable' 
      }, 400);
    }

    let aiResponse;

    // Call appropriate AI API based on provider
    if (apiProvider.toLowerCase() === 'deepseek') {
      aiResponse = await callDeepSeekAPI(body.messages, apiKey, model);
    } else if (baseURL) {
      // Use custom OpenAI-compatible API endpoint
      aiResponse = await callOpenAICompatibleAPI(body.messages, apiKey, baseURL, model);
    } else {
      // Default to OpenAI API format
      const openaiURL = apiProvider.toLowerCase() === 'openai' 
        ? 'https://api.openai.com/v1' 
        : baseURL;
      
      if (!openaiURL) {
        return jsonResponse({ 
          error: 'For custom providers, please provide baseURL' 
        }, 400);
      }
      
      aiResponse = await callOpenAICompatibleAPI(body.messages, apiKey, openaiURL, model);
    }

    // Extract the response message
    const assistantMessage = aiResponse.choices?.[0]?.message;
    
    if (!assistantMessage) {
      return jsonResponse({ error: 'Invalid response from AI API' }, 500);
    }

    // Return the response in a clean format
    return jsonResponse({
      success: true,
      message: assistantMessage,
      usage: aiResponse.usage,
      model: aiResponse.model,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat error:', error);
    return jsonResponse({ 
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    }, 500);
  }
}

// Health check endpoint
async function handleHealth() {
  return jsonResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return handleOptions();
    }

    // Route handling
    if (path === '/api/chat' && method === 'POST') {
      return handleChat(request, env);
    }

    if (path === '/health' || path === '/api/health') {
      return handleHealth();
    }

    // 404 for unknown routes
    return jsonResponse({ 
      error: 'Not found',
      message: 'Available endpoints: POST /api/chat, GET /health',
    }, 404);
  },
};
