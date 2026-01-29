'use client';

import { useChat } from '@ai-sdk/react';
import type { DataUIPart } from 'ai';
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';

const models = [
  {
    name: 'GPT 4o',
    value: 'openai/gpt-4o',
  },
  {
    name: 'Deepseek R1',
    value: 'deepseek/deepseek-r1',
  },
];

const CONTEXT_STORAGE_KEY = 'patient-chat-context';
const CHAT_ID_STORAGE_KEY = 'patient-chat-id';

type BackendStreamPayload = {
  type?: string;
  data?: unknown;
  context?: unknown;
};

type ChatDataParts = {
  backend: BackendStreamPayload;
};

type BackendDataPart = DataUIPart<ChatDataParts>;

export function Chat() {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [context, setContext] = useState<unknown | null>(null);
  const contextRef = useRef<unknown | null>(null);

  const handleDataPart = (dataPart: BackendDataPart) => {
    if (dataPart.type !== 'data-backend') return;

    const payload = dataPart.data;

    if (payload.type === 'reset') {
      setContext(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(CONTEXT_STORAGE_KEY);
      }
      return;
    }

    if (payload.context !== undefined) {
      setContext(payload.context ?? null);
      if (typeof window !== 'undefined') {
        try {
          if (payload.context == null) {
            sessionStorage.removeItem(CONTEXT_STORAGE_KEY);
          } else {
            sessionStorage.setItem(
              CONTEXT_STORAGE_KEY,
              JSON.stringify(payload.context)
            );
          }
        } catch {
          // Ignore storage write errors.
        }
      }
    }
  };

  const chat = useChat({ onData: handleDataPart });
  const { messages, sendMessage, status, regenerate } = chat;

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedContext = sessionStorage.getItem(CONTEXT_STORAGE_KEY);
    if (storedContext) {
      try {
        setContext(JSON.parse(storedContext));
      } catch {
        sessionStorage.removeItem(CONTEXT_STORAGE_KEY);
      }
    }

    let storedChatId = sessionStorage.getItem(CHAT_ID_STORAGE_KEY);
    if (!storedChatId) {
      storedChatId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `chat_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(CHAT_ID_STORAGE_KEY, storedChatId);
    }
    setChatId(storedChatId);
  }, []);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    const body: Record<string, unknown> = {
      model: model,
      webSearch: webSearch,
    };

    if (chatId) body.chatId = chatId;
    if (contextRef.current !== null && contextRef.current !== undefined) {
      body.context = contextRef.current;
    }

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files,
      },
      {
        body,
      }
    );
    setInput('');
  };

  return (
    <div className="relative mx-auto size-full">
      <div className="flex h-full flex-col">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' &&
                  message.parts.filter((part) => part.type === 'source-url')
                    .length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === 'source-url'
                          ).length
                        }
                      />
                      {message.parts
                        .filter((part) => part.type === 'source-url')
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Message key={`${message.id}-${i}`} from={message.role}>
                          <MessageContent>
                            <MessageResponse>{part.text}</MessageResponse>
                          </MessageContent>
                          {message.role === 'assistant' &&
                            i === messages.length - 1 && (
                              <MessageActions>
                                <MessageAction
                                  onClick={() => regenerate()}
                                  label="Retry"
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </MessageAction>
                                <MessageAction
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </MessageAction>
                              </MessageActions>
                            )}
                        </Message>
                      );
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === 'streaming' &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                variant={webSearch ? 'default' : 'ghost'}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {models.map((model) => (
                    <PromptInputSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
