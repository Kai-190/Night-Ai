const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 8000;
const MAX_TOTAL_LENGTH = 24000;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function onRequestPost(context) {
  const apiKey = context.env?.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonResponse({
      error: 'AI is not configured yet. Add OPENAI_API_KEY in the Cloudflare Pages environment and try again.'
    }, 503);
  }

  let body;
  try {
    const contentLength = Number(context.request.headers.get('content-length') || 0);
    if (contentLength > 100000) {
      return jsonResponse({ error: 'The chat request is too large.' }, 413);
    }
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Please send a valid chat request.' }, 400);
  }

  if (!Array.isArray(body?.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    return jsonResponse({ error: 'A chat must contain between 1 and 20 messages.' }, 400);
  }

  let totalLength = 0;
  const messages = [];
  for (const message of body.messages) {
    if (
      !message ||
      !['user', 'assistant'].includes(message.role) ||
      typeof message.content !== 'string' ||
      !message.content.trim() ||
      message.content.length > MAX_MESSAGE_LENGTH
    ) {
      return jsonResponse({ error: 'Chat messages must have a valid role and contain at most 8,000 characters.' }, 400);
    }

    totalLength += message.content.length;
    if (totalLength > MAX_TOTAL_LENGTH) {
      return jsonResponse({ error: 'This conversation is too long. Start a new chat and try again.' }, 400);
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }

  if (messages.at(-1).role !== 'user') {
    return jsonResponse({ error: 'The latest chat message must be from you.' }, 400);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: context.env?.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are NIGHT AI, a helpful assistant for small businesses. Give clear, practical answers. Do not claim access to workspace data unless the user has provided it in this conversation. Never ask for passwords, payment card details, or one-time passcodes.'
          },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      return jsonResponse({ error: 'The AI provider could not complete your request. Check your API configuration and try again.' }, 502);
    }

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return jsonResponse({ error: 'The AI provider returned an empty response. Please try again.' }, 502);
    }

    return jsonResponse({ reply: reply.trim() });
  } catch {
    return jsonResponse({ error: 'Unable to reach the AI provider. Please try again.' }, 502);
  }
}
