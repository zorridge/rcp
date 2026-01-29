import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';

const contextStore = new Map<string, unknown>();
const MAX_CONTEXTS = 200;
const STREAM_CHUNK_SIZE = Number(process.env.CHAT_STREAM_CHUNK_SIZE ?? 120);
const STREAM_CHUNK_DELAY_MS = Number(
  process.env.CHAT_STREAM_CHUNK_DELAY_MS ?? 0
);

type BackendResponse = {
  answer?: string;
  type?: 'point' | 'timeseries' | 'compare' | 'session_range' | 'error' | 'reset';
  data?: unknown;
  context?: unknown;
  error?: string;
};

type RequestBody = {
  id?: string;
  chatId?: string;
  message?: unknown;
  messages?: unknown[];
  text?: string;
  context?: unknown;
  data?: {
    context?: unknown;
  };
};

function readTextPart(parts: unknown[]): string | undefined {
  const textParts = parts
    .filter((part) => typeof part === 'object' && part !== null)
    .map((part) => part as { type?: string; text?: unknown; content?: unknown })
    .filter((part) => part.type === 'text' || typeof part.text === 'string');

  if (textParts.length === 0) {
    return undefined;
  }

  return textParts
    .map((part) =>
      typeof part.text === 'string'
        ? part.text
        : typeof part.content === 'string'
          ? part.content
          : ''
    )
    .join('')
    .trim();
}

function extractMessageText(message: unknown): string | undefined {
  if (message == null) return undefined;
  if (typeof message === 'string') return message.trim();

  if (typeof message === 'object') {
    const record = message as {
      text?: unknown;
      content?: unknown;
      parts?: unknown[];
      role?: unknown;
    };

    if (typeof record.text === 'string') return record.text.trim();
    if (typeof record.content === 'string') return record.content.trim();

    if (Array.isArray(record.content)) {
      const text = readTextPart(record.content);
      if (text) return text;
    }

    if (Array.isArray(record.parts)) {
      const text = readTextPart(record.parts);
      if (text) return text;
    }
  }

  return undefined;
}

function extractLatestUserMessage(body: RequestBody): string | undefined {
  if (body.text) return body.text.trim();

  const directMessage = extractMessageText(body.message);
  if (directMessage) return directMessage;

  if (Array.isArray(body.messages)) {
    for (let i = body.messages.length - 1; i >= 0; i -= 1) {
      const entry = body.messages[i] as { role?: unknown } | undefined;
      if (entry?.role === 'user') {
        const text = extractMessageText(entry);
        if (text) return text;
      }
    }
  }

  return undefined;
}

function getChatId(body: RequestBody): string | undefined {
  if (typeof body.id === 'string' && body.id.length > 0) return body.id;
  if (typeof body.chatId === 'string' && body.chatId.length > 0)
    return body.chatId;
  return undefined;
}

function getContext(body: RequestBody, chatId?: string): unknown {
  if (body.context !== undefined) return body.context;
  if (body.data?.context !== undefined) return body.data.context;
  if (chatId && contextStore.has(chatId)) return contextStore.get(chatId);
  return undefined;
}

function storeContext(chatId: string | undefined, context: unknown) {
  if (!chatId) return;
  contextStore.delete(chatId);
  contextStore.set(chatId, context);

  if (contextStore.size > MAX_CONTEXTS) {
    const oldestKey = contextStore.keys().next().value as string | undefined;
    if (oldestKey) contextStore.delete(oldestKey);
  }
}

function clearContext(chatId: string | undefined) {
  if (!chatId) return;
  contextStore.delete(chatId);
}

function chunkText(text: string): string[] {
  if (!STREAM_CHUNK_SIZE || text.length <= STREAM_CHUNK_SIZE) {
    return [text];
  }

  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += STREAM_CHUNK_SIZE) {
    chunks.push(text.slice(i, i + STREAM_CHUNK_SIZE));
  }

  return chunks;
}

async function streamTextChunks(
  write: (chunk: { type: string; [key: string]: unknown }) => void,
  text?: string
) {
  if (!text) return;

  const chunks = chunkText(text);
  write({ type: 'text-start', id: 'text-1' });
  for (const chunk of chunks) {
    write({ type: 'text-delta', id: 'text-1', delta: chunk });
    if (STREAM_CHUNK_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, STREAM_CHUNK_DELAY_MS));
    }
  }
  write({ type: 'text-end', id: 'text-1' });
}

function toUIMessageStreamResponse(payload: {
  text?: string;
  data?: Record<string, unknown>;
  error?: string;
}) {
  const { text, data, error } = payload;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      if (error) {
        writer.write({ type: 'error', errorText: error });
        writer.write({ type: 'finish', finishReason: 'error' });
        return;
      }

      await streamTextChunks(writer.write, text);

      if (data && Object.keys(data).length > 0) {
        writer.write({
          type: 'data-backend',
          data,
          transient: true,
        });
      }

      writer.write({ type: 'finish', finishReason: 'stop' });
    },
  });

  return createUIMessageStreamResponse({
    stream,
    headers: {
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return toUIMessageStreamResponse({
      error: 'Invalid JSON payload sent to /api/chat.',
    });
  }

  const userMessage = extractLatestUserMessage(body);
  if (!userMessage) {
    return toUIMessageStreamResponse({
      error: 'No user message found in the request body.',
    });
  }

  const pythonUrl = process.env.PYTHON_API_URL;
  if (!pythonUrl) {
    return toUIMessageStreamResponse({
      error:
        'Missing PYTHON_API_URL env var. Set it to your FastAPI endpoint.',
    });
  }

  const chatId = getChatId(body);
  const context = getContext(body, chatId);

  const payload = {
    message: userMessage,
    ...(context !== undefined ? { context } : {}),
  };

  let response: Response;
  try {
    response = await fetch(pythonUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: request.signal,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to reach backend.';
    return toUIMessageStreamResponse({
      error: `Backend request failed: ${message}`,
    });
  }

  let backend: BackendResponse = {};
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    return toUIMessageStreamResponse({
      error: `Backend error (${response.status}): ${errorText}`,
    });
  }

  if (contentType.includes('application/json')) {
    try {
      backend = (await response.json()) as BackendResponse;
    } catch {
      backend = { answer: '' };
    }
  } else {
    const text = await response.text();
    backend = { answer: text };
  }

  const answer = backend.answer ?? backend.error ?? '';
  if (backend.type === 'reset') {
    clearContext(chatId);
  } else if (backend.context !== undefined) {
    storeContext(chatId, backend.context);
  }

  const data = {
    ...(backend.type ? { type: backend.type } : {}),
    ...(backend.data !== undefined ? { data: backend.data } : {}),
    ...(backend.context !== undefined ? { context: backend.context } : {}),
  };

  return toUIMessageStreamResponse({
    text: answer,
    data,
  });
}
