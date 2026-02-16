import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  generateConferenceDetails,
  generateTracks,
  generateSessions,
  generateSessionDescription,
  generateSpeakerBio,
  generateSchedule,
  generateMarketingCopy,
  chatWithAssistant,
  ChatMessage,
  ConferenceDetailsContext,
  TracksContext,
  SessionsContext,
  SessionDescriptionContext,
  SpeakerBioContext,
  ScheduleContext,
  MarketingCopyContext,
} from '@cottage-cart/api'

// Hook for AI chat assistant
export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (userMessage: string) => {
    const newUserMessage: ChatMessage = { role: 'user', content: userMessage }
    setMessages(prev => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      const result = await chatWithAssistant(userMessage, messages)
      const assistantMessage: ChatMessage = { role: 'assistant', content: result.content }
      setMessages(prev => [...prev, assistantMessage])
      return result.content
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
  }
}

// Hook for conference details generation
export function useGenerateConferenceDetails() {
  return useMutation({
    mutationFn: (context: ConferenceDetailsContext) => generateConferenceDetails(context),
  })
}

// Hook for tracks generation
export function useGenerateTracks() {
  return useMutation({
    mutationFn: (context: TracksContext) => generateTracks(context),
  })
}

// Hook for sessions generation
export function useGenerateSessions() {
  return useMutation({
    mutationFn: (context: SessionsContext) => generateSessions(context),
  })
}

// Hook for session description generation
export function useGenerateSessionDescription() {
  return useMutation({
    mutationFn: (context: SessionDescriptionContext) => generateSessionDescription(context),
  })
}

// Hook for speaker bio generation
export function useGenerateSpeakerBio() {
  return useMutation({
    mutationFn: (context: SpeakerBioContext) => generateSpeakerBio(context),
  })
}

// Hook for schedule generation
export function useGenerateSchedule() {
  return useMutation({
    mutationFn: (context: ScheduleContext) => generateSchedule(context),
  })
}

// Hook for marketing copy generation
export function useGenerateMarketingCopy() {
  return useMutation({
    mutationFn: (context: MarketingCopyContext) => generateMarketingCopy(context),
  })
}

// Unified hook for any AI generation with loading state
export function useAIGeneration<TContext, TResult>(
  generatorFn: (context: TContext) => Promise<{ content: TResult }>
) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TResult | null>(null)

  const generate = useCallback(async (context: TContext): Promise<TResult | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await generatorFn(context)
      setResult(response.content)
      return response.content
    } catch (err: any) {
      setError(err.message || 'Generation failed')
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [generatorFn])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    generate,
    result,
    isGenerating,
    error,
    reset,
  }
}
