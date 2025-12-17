#!/bin/bash

echo "🚀 Interlume Deployment Helper"
echo "================================"
echo ""

# Generate secret
echo "📝 Generating BETTER_AUTH_SECRET..."
SECRET=$(openssl rand -base64 32)
echo "BETTER_AUTH_SECRET=$SECRET"
echo ""

# Checklist
echo "✅ Deployment Checklist:"
echo ""
echo "1. Create Supabase project: https://supabase.com"
echo "2. Get your database URLs from Supabase → Settings → Database"
echo "3. Create Render account: https://render.com"
echo "4. Push code to GitHub"
echo "5. Deploy using render.yaml (see DEPLOYMENT.md)"
echo ""

echo "📋 Environment Variables Needed:"
echo ""
echo "BETTER_AUTH_SECRET=$SECRET"
echo "AUTH_SECRET=$SECRET"
echo "BETTER_AUTH_URL=https://your-app-name.onrender.com"
echo "NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com"
echo "DATABASE_URL=<from-supabase-pooler>"
echo "DIRECT_URL=<from-supabase-direct>"
echo "OPENAI_API_KEY=<your-openai-key>"
echo "ASSEMBLYAI_API_KEY=<your-assemblyai-key>"
echo "NEXT_PUBLIC_VOICE_AGENT_WS_URL=wss://your-voice-agent.onrender.com/ws"
echo "ALLOWED_ORIGINS=https://your-app-name.onrender.com"
echo ""

echo "📖 Full guide: See DEPLOYMENT.md"
echo ""
