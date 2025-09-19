# Backend Environment Variables Update

## Current Issue
Your backend is deployed but needs the frontend URL to be added to CORS configuration.

## Required Environment Variables for Backend on Render:

```
FRONTEND_URL=https://your-netlify-url.netlify.app
JWT_SECRET=your-super-secret-jwt-key-must-be-at-least-32-characters-long-for-security-purposes
MONGODB_URI=mongodb+srv://opvmro460:oQSi3PUnafrbOwQv@cluster0.57nzu.mongodb.net/lead-management-system?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
PORT=10000
```

## Steps to Fix:

1. **Go to your Render Dashboard**
2. **Select your backend service**: `lead-management-system-wlg0`
3. **Go to Environment tab**
4. **Add FRONTEND_URL**: Set it to your Netlify URL (e.g., `https://your-app.netlify.app`)
5. **Save Changes** - This will trigger a redeploy

## Your Current Backend URL:
https://lead-management-system-wlg0.onrender.com

## Test Backend is Working:
Visit: https://lead-management-system-wlg0.onrender.com/health

This should return:
```json
{
  "status": "OK",
  "timestamp": "...",
  "environment": "production"
}
```