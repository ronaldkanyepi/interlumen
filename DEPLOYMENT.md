# Render Deployment Guide for Interlume

## Prerequisites

1. A [Render](https://render.com) account
2. A GitHub repository with your code
3. A Supabase PostgreSQL database (or any PostgreSQL database)
4. OpenAI API key
5. AssemblyAI API key

---

## Deployment Steps

### Option 1: Blueprint Deployment (Recommended)

This will deploy both services automatically using the `render.yaml` file.

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create New Blueprint on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and create both services

3. **Configure Environment Variables**
   
   For **interlume-web** service:
   ```
   BETTER_AUTH_SECRET=<generate-random-string-32-chars>
   AUTH_SECRET=<same-as-above>
   BETTER_AUTH_URL=https://your-app-name.onrender.com
   NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
   DATABASE_URL=<your-supabase-pooler-url>
   DIRECT_URL=<your-supabase-direct-url>
   OPENAI_API_KEY=<your-openai-key>
   ASSEMBLYAI_API_KEY=<your-assemblyai-key>
   GOOGLE_CLIENT_ID=<optional>
   GOOGLE_CLIENT_SECRET=<optional>
   GITHUB_CLIENT_ID=<optional>
   GITHUB_CLIENT_SECRET=<optional>
   NEXT_PUBLIC_VOICE_AGENT_WS_URL=wss://your-voice-agent-name.onrender.com/ws
   ALLOWED_ORIGINS=https://your-app-name.onrender.com
   ```

   For **interlume-voice-agent** service:
   ```
   DATABASE_URL=<your-supabase-pooler-url>
   DIRECT_URL=<your-supabase-direct-url>
   OPENAI_API_KEY=<your-openai-key>
   ASSEMBLYAI_API_KEY=<your-assemblyai-key>
   ALLOWED_ORIGINS=https://your-app-name.onrender.com
   NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
   ```

4. **Deploy**
   - Click "Apply" to deploy both services
   - Wait for builds to complete (5-10 minutes)

---

### Option 2: Manual Deployment

#### Step 1: Deploy the Voice Agent

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `interlume-voice-agent`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev:voice`
   - **Plan**: Starter (or Free)

4. Add Environment Variables (see above)

5. Click "Create Web Service"

6. **Note the URL**: `https://interlume-voice-agent.onrender.com`

#### Step 2: Deploy the Next.js Web App

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `interlume-web`
   - **Region**: Oregon (same as voice agent)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter (or Free)

4. Add Environment Variables (see above)
   - **IMPORTANT**: Set `NEXT_PUBLIC_VOICE_AGENT_WS_URL` to the voice agent URL from Step 1

5. Click "Create Web Service"

---

## Database Setup

### Using Supabase (Recommended)

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Get your connection strings:
   - **Pooler URL** (for DATABASE_URL): 
     ```
     Settings → Database → Connection String → URI (Session pooler)
     ```
   - **Direct URL** (for DIRECT_URL):
     ```
     Settings → Database → Connection String → URI (Direct connection)
     ```

3. Run migrations:
   ```bash
   # Locally first
   npm run db:push
   ```

---

## Post-Deployment Configuration

### 1. Update OAuth Redirect URLs

If using Google/GitHub OAuth:

**Google Console:**
- Authorized redirect URIs: `https://your-app-name.onrender.com/api/auth/callback/google`

**GitHub Settings:**
- Authorization callback URL: `https://your-app-name.onrender.com/api/auth/callback/github`

### 2. Test the Deployment

1. Visit `https://your-app-name.onrender.com`
2. Create an account
3. Start an interview to test WebSocket connection
4. Check logs in Render dashboard if issues occur

### 3. Custom Domain (Optional)

1. Go to your web service settings
2. Click "Custom Domain"
3. Add your domain and follow DNS instructions

---

## Troubleshooting

### Build Fails

**Error**: "Module not found"
- **Solution**: Make sure all dependencies are in `package.json`, not `devDependencies`

**Error**: "Out of memory"
- **Solution**: Upgrade to a paid plan or reduce build size

### WebSocket Connection Fails

**Error**: "WebSocket connection failed"
- **Solution**: 
  1. Check `NEXT_PUBLIC_VOICE_AGENT_WS_URL` uses `wss://` (not `ws://`)
  2. Verify `ALLOWED_ORIGINS` includes your web app URL
  3. Check voice agent service is running

### Database Connection Issues

**Error**: "Connection timeout"
- **Solution**: 
  1. Verify DATABASE_URL is the pooler URL (port 6543)
  2. Check Supabase allows connections from Render IPs
  3. Ensure SSL is enabled in connection string

### Authentication Issues

**Error**: "Session not found"
- **Solution**:
  1. Verify `BETTER_AUTH_SECRET` is set and matches
  2. Check `BETTER_AUTH_URL` matches your actual domain
  3. Clear cookies and try again

---

## Monitoring

### View Logs

1. Go to your service in Render dashboard
2. Click "Logs" tab
3. Monitor for errors

### Health Checks

Render automatically monitors your services. If a service crashes, it will auto-restart.

---

## Scaling

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds

### Upgrade to Paid Plan

For production use:
- **Starter Plan** ($7/month per service): No spin-down, better performance
- **Standard Plan** ($25/month per service): More resources, faster builds

---

## Environment Variable Reference

### Required for Web App

| Variable | Description | Example |
|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | Auth encryption key (32+ chars) | `your-secret-key-here` |
| `BETTER_AUTH_URL` | Your app URL | `https://app.onrender.com` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `https://app.onrender.com` |
| `DATABASE_URL` | Postgres pooler URL | `postgresql://...` |
| `DIRECT_URL` | Postgres direct URL | `postgresql://...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `ASSEMBLYAI_API_KEY` | AssemblyAI API key | `...` |
| `NEXT_PUBLIC_VOICE_AGENT_WS_URL` | Voice agent WebSocket URL | `wss://voice.onrender.com/ws` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://app.onrender.com` |

### Optional

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |

---

## Cost Estimate

### Free Tier
- 2 services × $0 = **$0/month**
- Limitations: Spin-down after inactivity

### Starter Tier (Recommended)
- 2 services × $7 = **$14/month**
- No spin-down, better performance

### Database (Supabase)
- Free tier: **$0/month** (500MB, 2GB bandwidth)
- Pro tier: **$25/month** (8GB, 50GB bandwidth)

---

## Quick Commands

```bash
# Generate secret key
openssl rand -base64 32

# Test locally before deploying
npm run dev:all

# Push to deploy
git push origin main

# View logs (if using Render CLI)
render logs -s interlume-web
render logs -s interlume-voice-agent
```

---

## Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Supabase Docs**: https://supabase.com/docs

---

## Next Steps

1. ✅ Deploy both services
2. ✅ Configure environment variables
3. ✅ Run database migrations
4. ✅ Test the application
5. ✅ Set up custom domain (optional)
6. ✅ Configure OAuth providers (optional)
7. ✅ Monitor logs and performance

Good luck with your deployment! 🚀
