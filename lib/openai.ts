/**
 * OpenAI Client Configuration
 *
 * This module provides a configured OpenAI client for AI-powered
 * financial insights chat functionality.
 *
 * Setup:
 * 1. Get an API key from https://platform.openai.com/api-keys
 * 2. Add to `.env.local`: OPENAI_API_KEY=sk-...
 * 3. Restart dev server
 *
 * Cost: ~$0.01-0.05 per conversation with GPT-4o
 */

import OpenAI from 'openai'

/**
 * Get OpenAI client instance
 * Returns null if API key is not configured
 */
export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn(
      'OpenAI API key not found. Set OPENAI_API_KEY in .env.local to enable AI chat.'
    )
    return null
  }

  return new OpenAI({
    apiKey,
  })
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}
