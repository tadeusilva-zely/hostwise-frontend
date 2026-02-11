import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendChatMessage,
  getChatConversations,
  getConversationMessages,
  deleteChatConversation,
  getChatUsage,
  type ChatMessageData,
} from '../services/api';

export function useChat() {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch usage info
  const { data: usage, refetch: refetchUsage } = useQuery({
    queryKey: ['chat-usage'],
    queryFn: getChatUsage,
    staleTime: 1000 * 60,
  });

  // Fetch conversations list
  const { data: conversationsData, refetch: refetchConversations } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: getChatConversations,
    staleTime: 1000 * 60,
  });

  const conversations = conversationsData?.conversations ?? [];

  // Load conversation messages when switching
  const loadConversation = useCallback(async (id: string) => {
    setConversationId(id);
    try {
      const data = await getConversationMessages(id);
      setMessages(data.messages);
    } catch {
      setMessages([]);
    }
  }, []);

  // Start new conversation
  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
  }, []);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, data.message]);
      setIsSending(false);
      refetchUsage();
      refetchConversations();
    },
    onError: (error: Error & { response?: { status: number; data?: { error?: string } } }) => {
      setIsSending(false);
      if (error.response?.status === 403) {
        setShowCreditModal(true);
        // Remove the optimistic user message
        setMessages((prev) => prev.slice(0, -1));
      } else {
        const serverMsg = error.response?.data?.error;
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: 'error-' + Date.now(),
            role: 'ASSISTANT' as const,
            content: serverMsg || 'Desculpe, houve um erro ao processar sua pergunta. Tente novamente.',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    },
  });

  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || isSending) return;

      // Optimistic update: show user message immediately
      const optimisticMsg: ChatMessageData = {
        id: 'temp-' + Date.now(),
        role: 'USER',
        content: message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      setIsSending(true);

      sendMutation.mutate({
        conversationId: conversationId ?? undefined,
        message,
      });
    },
    [conversationId, isSending, sendMutation],
  );

  // Delete conversation
  const deleteConversation = useCallback(
    async (id: string) => {
      // Optimistic: remove from cache immediately
      queryClient.setQueryData<{ conversations: typeof conversations }>(
        ['chat-conversations'],
        (old) => ({
          conversations: (old?.conversations ?? []).filter((c) => c.id !== id),
        }),
      );
      if (conversationId === id) {
        startNewConversation();
      }
      try {
        await deleteChatConversation(id);
      } catch {
        // Revert on failure
        refetchConversations();
      }
    },
    [conversationId, startNewConversation, refetchConversations, queryClient],
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return {
    messages,
    conversationId,
    conversations,
    usage,
    isSending,
    showCreditModal,
    setShowCreditModal,
    messagesEndRef,
    sendMessage,
    loadConversation,
    startNewConversation,
    deleteConversation,
  };
}
