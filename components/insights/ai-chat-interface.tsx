"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Sparkles, Send, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

/**
 * AI Chat Interface Component
 *
 * Provides a conversational interface for users to ask questions
 * about their spending habits using OpenAI GPT-4o.
 */

const SUGGESTED_QUESTIONS = [
  {
    id: 1,
    text: "Where could I be saving based on my spending?",
    icon: "💰",
  },
  {
    id: 2,
    text: "How am I doing this month?",
    icon: "📊",
  },
  {
    id: 3,
    text: "What are my biggest expense categories?",
    icon: "🔍",
  },
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatInterfaceProps {
  month?: string
}

export function AIChatInterface({ month }: AIChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const askQuestion = async (question: string) => {
    if (!question.trim()) return

    // Add user message to chat
    const userMessage: Message = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insights/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, month }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle OpenAI not configured error
        if (response.status === 503) {
          setError(errorData.message || 'OpenAI not configured')
          toast.error("AI Chat Not Configured", {
            description: "Add your OpenAI API key to .env.local to enable chat.",
          })
          return
        }

        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.answer }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      toast.error("Chat Error", {
        description: "Failed to get response from Toasty. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !loading) {
      askQuestion(inputValue)
      setInputValue("")
    }
  }

  const handleQuestionClick = (question: string) => {
    if (!loading) {
      askQuestion(question)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-stone-50 to-stone-100 border-stone-200/50 shadow-xl">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800">
            Ask Toasty Anything
          </h2>
        </div>

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md'
                      : 'bg-white border-2 border-stone-200 text-stone-800 shadow-sm'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🍞</span>
                      <span className="text-xs font-semibold text-stone-600">Toasty</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border-2 border-stone-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    <span className="text-sm text-stone-600">Toasty is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error Message */}
        {error && messages.length === 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Chat Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {error.includes('OpenAI') && (
                  <p className="text-xs text-red-600 mt-2">
                    Add OPENAI_API_KEY to your .env.local file. Get a key from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                    >
                      OpenAI
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask me anything about your spending..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            className="flex-1 bg-white border-stone-300 focus:border-amber-500 focus:ring-amber-500/20 disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !inputValue.trim()}
            className="bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </form>

        {/* Suggested Questions (only show when no messages) */}
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-stone-600 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Suggested questions:
            </p>
            <div className="grid gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <Button
                  key={question.id}
                  variant="outline"
                  disabled={loading}
                  className="justify-start text-left h-auto py-3 px-4 bg-white hover:bg-amber-50 border-stone-200 hover:border-amber-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                  onClick={() => handleQuestionClick(question.text)}
                >
                  <span className="mr-2 text-lg">{question.icon}</span>
                  <span className="text-sm text-stone-700">{question.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Info Note */}
        <p className="text-xs text-stone-500 text-center pt-2 border-t border-stone-200">
          💡 AI insights are generated based on your spending patterns and budget data
        </p>
      </div>
    </Card>
  )
}
