'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { MessageCircle, Send, Bot, User, Minimize2, Paperclip, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  file?: {
    name: string
    type: string
    url: string
  }
}

interface WebhookConfig {
  method: string
  headers: Record<string, string>
}

interface ChatBotProps {
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
  className?: string
  
  // Custom props
  userId?: string
}

const defaultProps: Partial<ChatBotProps> = {
  webhookConfig: { method: 'POST', headers: {} },
  mode: 'window',
  showWelcomeScreen: false,
  chatInputKey: 'chatInput',
  chatSessionKey: 'sessionId',
  loadPreviousSession: true,
  defaultLanguage: 'en',
  initialMessages: ['Merhaba! Size nasıl yardımcı olabilirim?'],
  allowFileUploads: false,
  allowedFilesMimeTypes: '',
  userId: 'user'
}

export function ChatBot(props: ChatBotProps) {
  const config = { ...defaultProps, ...props }
  
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => {
    return config.initialMessages!.map((text, index) => ({
      id: `initial-${index}`,
      text,
      sender: 'bot' as const,
      timestamp: new Date()
    }))
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Load previous session (placeholder for future implementation)
  useEffect(() => {
    if (config.loadPreviousSession && isOpen) {
      // TODO: Load previous messages from localStorage or API
      // const previousMessages = loadMessagesFromStorage(sessionId)
      // if (previousMessages.length > 0) {
      //   setMessages(prev => [...previousMessages, ...prev])
      // }
    }
  }, [isOpen, config.loadPreviousSession, sessionId])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check allowed MIME types
    if (config.allowedFilesMimeTypes && config.allowedFilesMimeTypes.trim()) {
      const allowedTypes = config.allowedFilesMimeTypes.split(',').map(type => type.trim())
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'))
        }
        return file.type === type
      })

      if (!isAllowed) {
        toast.error('Dosya Türü Desteklenmiyor', {
          description: `İzin verilen türler: ${config.allowedFilesMimeTypes}`
        })
        return
      }
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya Çok Büyük', {
        description: 'Dosya boyutu 10MB\'dan küçük olmalıdır.'
      })
      return
    }

    setSelectedFile(file)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || isLoading) return

    const messageText = input.trim() || (selectedFile ? `[Dosya: ${selectedFile.name}]` : '')
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      file: selectedFile ? {
        name: selectedFile.name,
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile)
      } : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const formData = new FormData()
      
      // Add chat input
      formData.append(config.chatInputKey!, userMessage.text)
      
      // Add session ID
      formData.append(config.chatSessionKey!, sessionId)
      
      // Add user ID if provided
      if (config.userId) {
        formData.append('userId', config.userId)
      }
      
      // Add file if selected
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const requestOptions: RequestInit = {
        method: config.webhookConfig!.method,
        headers: {
          ...config.webhookConfig!.headers,
          // Don't set Content-Type when using FormData
        },
        body: formData
      }

      const response = await fetch(config.webhookUrl, requestOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Simulate typing delay
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.message || result.output || 'Üzgünüm, yanıt alamadım.',
          sender: 'bot',
          timestamp: new Date()
        }

        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
        
        // Save to session storage (optional)
        if (config.loadPreviousSession) {
          // TODO: Save messages to localStorage
          // saveMessagesToStorage(sessionId, [...messages, userMessage, botMessage])
        }
      }, 1000)

    } catch (error) {
      console.error('Chatbot error:', error)
      
      setTimeout(() => {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.',
          sender: 'bot',
          timestamp: new Date()
        }

        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
        
        toast.error("Bağlantı Hatası", {
          description: "Chatbot servisine bağlanılamadı."
        })
      }, 1000)
    } finally {
      setIsLoading(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages(config.initialMessages!.map((text, index) => ({
      id: `initial-${index}`,
      text,
      sender: 'bot' as const,
      timestamp: new Date()
    })))
    
    // Clear session storage
    if (config.loadPreviousSession) {
      // TODO: Clear messages from localStorage
      // clearMessagesFromStorage(sessionId)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(config.defaultLanguage === 'tr' ? 'tr-TR' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Fullscreen mode
  if (config.mode === 'fullscreen') {
    return (
      <div className={cn("w-full h-full flex flex-col", config.className)}>
        <div className="flex-1 flex flex-col">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 max-w-[80%]",
                    message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={cn(
                      "text-xs",
                      message.sender === 'user' 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-500 text-white"
                    )}>
                      {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn(
                    "flex flex-col gap-1",
                    message.sender === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "rounded-lg px-3 py-2 text-sm break-words",
                      message.sender === 'user'
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    )}>
                      {message.text}
                      {message.file && (
                        <div className="mt-2 p-2 bg-black/10 rounded border">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-xs">{message.file.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gray-500 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
            {selectedFile && (
              <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={removeSelectedFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                disabled={isLoading}
                className="flex-1"
              />
              
              {config.allowFileUploads && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept={config.allowedFilesMimeTypes || undefined}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                onClick={sendMessage}
                disabled={(!input.trim() && !selectedFile) || isLoading}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI ile desteklenen asistan
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Window mode (default)
  return (
    <div className={cn("fixed bottom-4 right-4 z-50", config.className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md h-[600px] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Asistan
              <div className="ml-auto flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  onClick={clearChat}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col h-[500px]">
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 max-w-[80%]",
                      message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={cn(
                        "text-xs",
                        message.sender === 'user' 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-500 text-white"
                      )}>
                        {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={cn(
                      "flex flex-col gap-1",
                      message.sender === 'user' ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "rounded-lg px-3 py-2 text-sm break-words",
                        message.sender === 'user'
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                      )}>
                        {message.text}
                        {message.file && (
                          <div className="mt-2 p-2 bg-black/10 rounded border">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4" />
                              <span className="text-xs">{message.file.name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 max-w-[80%]">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-gray-500 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
              {selectedFile && (
                <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm">{selectedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={removeSelectedFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  disabled={isLoading}
                  className="flex-1"
                />
                
                {config.allowFileUploads && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept={config.allowedFilesMimeTypes || undefined}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={sendMessage}
                  disabled={(!input.trim() && !selectedFile) || isLoading}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI ile desteklenen asistan
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}