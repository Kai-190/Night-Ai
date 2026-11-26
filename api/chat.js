const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 8000;
const MAX_TOTAL_LENGTH = 24000;

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readRequestBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  let rawBody = '';
  for await (const chunk of req) {
    rawBody += chunk;
    if (rawBody.length > 100_000) {
      throw new Error('Request body is too large.');
    }
  }
  return JSON.parse(rawBody);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 503, {
      error: 'AI is not configured yet. Add OPENAI_API_KEY to the server environment and try again.'
    });
  }

  let body;
  try {
    body = await readRequestBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Please send a valid chat request.' });
  }

  if (!Array.isArray(body?.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    return sendJson(res, 400, { error: 'A chat must contain between 1 and 20 messages.' });
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
      return sendJson(res, 400, { error: 'Chat messages must have a valid role and contain at most 8,000 characters.' });
    }

    totalLength += message.content.length;
    if (totalLength > MAX_TOTAL_LENGTH) {
      return sendJson(res, 400, { error: 'This conversation is too long. Start a new chat and try again.' });
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }

  if (messages[messages.length - 1].role !== 'user') {
    return sendJson(res, 400, { error: 'The latest chat message must be from you.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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
      console.error(`OpenAI chat request failed with status ${response.status}.`);
      return sendJson(res, 502, { error: 'The AI provider could not complete your request. Check your API configuration and try again.' });
    }

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      console.error('OpenAI chat response did not contain a text reply.');
      return sendJson(res, 502, { error: 'The AI provider returned an empty response. Please try again.' });
    }

    return sendJson(res, 200, { reply: reply.trim() });
  } catch (error) {
    console.error('OpenAI chat request failed.', error);
    return sendJson(res, 502, { error: 'Unable to reach the AI provider. Please try again.' });
  }
}
