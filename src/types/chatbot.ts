// src/types/chatbot.ts

export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  file?: {
    name: string
    type: string
    url: string
    size?: number
  }
}

export interface WebhookConfig {
  method: string
  headers: Record<string, string>
}

export interface ChatBotConfig {
  // Required
  webhookUrl: string
  
  // Optional with defaults
  webhookConfig?: WebhookConfig
  mode?: 'window' | 'fullscreen'
  showWelcomeScreen?: boolean
  chatInputKey?: string
  chatSessionKey?: string
  loadPreviousSession?: boolean
  defaultLanguage?: string
  initialMessages?: string[]
  allowFileUploads?: boolean
  allowedFilesMimeTypes?: string
  
  // Custom props
  userId?: string
  className?: string
}

export interface N8NWebhookRequest {
  chatInput: string
  sessionId: string
  userId?: string
  file?: File
}

export interface N8NWebhookResponse {
  message?: string
  output?: string
  status?: 'success' | 'error'
  timestamp?: string
  sessionId?: string
}