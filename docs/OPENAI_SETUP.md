# OpenAI Setup Guide for AI Chat Feature

> ## ⚠️ DEPRECATION NOTICE
> **This feature has been deprecated as of October 24, 2025.**
>
> The AI-powered chat interface on the Insights page has been **replaced with a Net Worth Tracking Dashboard**.
>
> This documentation is kept for historical reference only. The OpenAI integration code remains in the codebase but is no longer actively used or maintained.

---

This guide will help you set up the AI-powered chat functionality in Bready using OpenAI's GPT-4o model.

## Overview

The AI chat feature allows users to ask natural language questions about their spending habits and get intelligent, personalized responses from Toasty 🍞.

**Example Questions:**
- "What are my biggest expense categories?"
- "Where could I be saving money?"
- "How am I doing this month?"
- "Which budgets am I close to exceeding?"

## Step 1: Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Navigate to **API Keys** in the left sidebar
4. Click **"Create new secret key"**
5. Give it a name (e.g., "Bready Development")
6. Copy the API key (starts with `sk-...`)
   - ⚠️ **Important**: Save this key somewhere safe - you won't be able to see it again!

## Step 2: Add API Key to Your Project

1. Open your project root directory
2. Create or edit the `.env.local` file (create it if it doesn't exist)
3. Add the following line:

```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

**Example `.env.local` file:**
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-abc123...xyz789

# Other environment variables
DATABASE_URL="file:./dev.db"
```

4. Save the file

## Step 3: Restart Development Server

The app needs to be restarted to pick up the new environment variable:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it:
npm run dev
```

## Step 4: Test the Chat Feature

1. Navigate to the **Insights** page in your app
2. You should see the "Ask Toasty Anything" chat interface
3. Try asking a suggested question or type your own
4. Toasty should respond within 2-5 seconds!

## Cost Information

### Pricing
OpenAI charges based on token usage (input + output):

- **Model Used**: GPT-4o
- **Cost**: ~$0.01-0.05 per conversation
- **Average Conversation**: 5-10 questions typically costs less than $0.25

### Cost Estimates
- Single question: ~$0.01-0.02
- 10 conversations/day: ~$0.50-1.00/month
- 50 conversations/day: ~$2.50-5.00/month

### Monitor Your Usage
- View usage at: [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Set spending limits: [OpenAI Billing Settings](https://platform.openai.com/account/billing/limits)

## Troubleshooting

### Error: "OpenAI not configured"

**Problem**: API key is not set or not loaded correctly

**Solutions:**
1. Check that `.env.local` exists in the project root (same directory as `package.json`)
2. Verify the API key starts with `sk-` and has no extra spaces
3. Restart the dev server (`Ctrl+C`, then `npm run dev`)
4. Make sure `.env.local` is NOT committed to git (it should be in `.gitignore`)

### Error: "Invalid API key"

**Problem**: The API key is incorrect or expired

**Solutions:**
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Replace the old key in `.env.local`
4. Restart the dev server

### Error: "Insufficient credits"

**Problem**: Your OpenAI account has run out of credits

**Solutions:**
1. Go to [OpenAI Billing](https://platform.openai.com/account/billing/overview)
2. Add a payment method and credits
3. Set up automatic recharge to avoid interruptions

### Chat is slow or timing out

**Problem**: Network issues or high API load

**Solutions:**
1. Check your internet connection
2. Try again in a few seconds
3. Simplify your question (shorter questions process faster)
4. Check [OpenAI Status](https://status.openai.com/) for service issues

## Security Best Practices

### ✅ DO
- Keep `.env.local` in `.gitignore` (never commit it)
- Use separate API keys for development and production
- Set spending limits on your OpenAI account
- Rotate API keys periodically (every 3-6 months)

### ❌ DON'T
- Share your API key publicly (GitHub, Discord, etc.)
- Hardcode the API key in your source code
- Use the same key across multiple projects
- Give your API key to others

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Add `OPENAI_API_KEY` as an environment variable in your hosting platform
2. **Vercel**: Project Settings → Environment Variables
3. **Netlify**: Site Settings → Build & deploy → Environment
4. Redeploy your application

## Need Help?

- **OpenAI Documentation**: https://platform.openai.com/docs
- **OpenAI Support**: https://help.openai.com
- **Bready Issues**: https://github.com/yourusername/bready/issues

## Optional: Advanced Configuration

### Custom Temperature (Response Creativity)

Edit `app/api/insights/chat/route.ts`:

```typescript
temperature: 0.7  // 0.0 = very focused, 1.0 = very creative
```

### Increase Max Response Length

Edit `app/api/insights/chat/route.ts`:

```typescript
max_tokens: 500  // Increase for longer responses (costs more)
```

### Switch to GPT-3.5 (Cheaper, Faster)

Edit `app/api/insights/chat/route.ts`:

```typescript
model: 'gpt-3.5-turbo'  // 10x cheaper, slightly less accurate
```

---

**🎉 You're all set! Toasty is ready to help with your finances!**
