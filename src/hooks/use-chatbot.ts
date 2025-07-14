// src/hooks/use-chatbot.ts

import { useState, useCallback } from 'react'
import { ChatMessage, N8NWebhookRequest, N8NWebhookResponse } from '@/types/chatbot'

interface UseChatBotProps {
  webhookUrl: string
  userId: string
  initialMessage?: string
}

export function useChatBot({ webhookUrl, userId, initialMessage }: UseChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: initialMessage || 'Merhaba! Size nasıl yardımcı olabilirim?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const requestBody: N8NWebhookRequest = {
        chatInput: userMessage.text,
        userId: userId
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: N8NWebhookResponse = await response.json()
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: result.message || 'Üzgünüm, yanıt alamadım.',
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])

    } catch (err) {
      console.error('Chatbot error:', err)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.',
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      setError('Bağlantı hatası oluştu')
    } finally {
      setIsLoading(false)
    }
  }, [webhookUrl, userId, isLoading])

  const clearMessages = useCallback(() => {
    setMessages([{
      id: '1',
      text: initialMessage || 'Merhaba! Size nasıl yardımcı olabilirim?',
      sender: 'bot',
      timestamp: new Date()
    }])
    setError(null)
  }, [initialMessage])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  }
}