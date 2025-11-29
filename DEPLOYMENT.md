# Deployment Guide

## Quick Deploy Options

### Option 1: GitHub Pages (Frontend) + Railway (Backend)

#### Frontend to GitHub Pages
1. **Enable GitHub Pages:**
   - Go to your repo → Settings → Pages
   - Source: "GitHub Actions"
   - Save

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add deployment workflow"
   git push origin main
   ```

3. **Workflow runs automatically** and deploys to:
   - `https://YOUR_USERNAME.github.io/trac/`

#### Backend to Railway (Free Tier)
1. **Go to [Railway.app](https://railway.app)**
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `trac` repository
5. Railway auto-detects Python and installs dependencies
6. Add environment variable: `PORT=5001`
7. Your backend will be at: `https://your-app.railway.app`

8. **Update Frontend API URL:**
   - Go to GitHub → Settings → Secrets → Actions
   - Add secret: `BACKEND_URL` = `https://your-app.railway.app/api`
   - Push again to rebuild with new URL

---

### Option 2: Render (All-in-One)

#### Deploy Backend to Render
1. **Go to [Render.com](https://render.com)**
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: habitcommit-api
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
   - **Plan**: Free
5. Click "Create Web Service"
6. Your API: `https://habitcommit-api.onrender.com`

#### Deploy Frontend to Render
1. Click "New +" → "Static Site"
2. Connect same repo
3. Configure:
   - **Name**: habitcommit
   - **Build Command**: Leave empty (static files)
   - **Publish Directory**: `.`
4. Add environment variable:
   - Key: `BACKEND_URL`
   - Value: `https://habitcommit-api.onrender.com/api`
5. Before building, update `app.js`:
   ```javascript
   this.API_BASE = 'https://habitcommit-api.onrender.com/api';
   ```

---

### Option 3: Vercel (Frontend) + Railway (Backend)

#### Frontend to Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Backend to Railway
Same as Option 1

---

## Local Testing

```bash
# Terminal 1 - Backend
python server.py

# Terminal 2 - Frontend
open index.html
# Or use a simple server:
python -m http.server 8000
```

## Environment Variables

### For Production Backend
Create `.env` file (add to `.gitignore`):
```
PORT=5001
DATABASE_PATH=habits.db
FLASK_ENV=production
```

### For Production Frontend
The workflow automatically replaces localhost with your backend URL using GitHub Secrets.

## Database in Production

**Important**: SQLite databases reset on container restart (Railway/Render free tier).

**Solutions:**
1. **Use persistent volume** (Railway Pro, Render paid)
2. **Upgrade to PostgreSQL:**
   - Railway provides free PostgreSQL
   - Update `database.py` to use PostgreSQL instead of SQLite

3. **Quick PostgreSQL Migration:**
   ```bash
   pip install psycopg2-binary
   ```
   
   Update `database.py`:
   ```python
   import os
   import psycopg2
   
   DATABASE_URL = os.getenv('DATABASE_URL')  # Railway provides this
   ```

## Monitoring Deployments

### GitHub Actions
- Go to your repo → Actions tab
- See all workflow runs and logs

### Railway
- Dashboard shows deployments, logs, metrics
- Automatic GitHub integration triggers deploys

### Render
- Dashboard shows build logs
- Auto-deploys on git push

## Troubleshooting

### Frontend can't reach backend
- Check CORS is enabled (already done in `server.py`)
- Verify `BACKEND_URL` secret is set correctly
- Check browser console for errors

### Railway deployment fails
- Check build logs in Railway dashboard
- Ensure `requirements.txt` is committed
- Verify Python version compatibility

### GitHub Pages 404
- Ensure workflow completed successfully
- Check Pages settings enabled
- Wait 5-10 minutes for DNS propagation
