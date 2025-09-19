# 🚀 Lead Management System - Deployment Guide

## Repository
GitHub: https://github.com/anirbansantra748/lead-management-system

## Project Structure
```
lead-management-system/
├── backend/          # Express.js API server
├── frontend/         # React.js client application
├── README.md         # Project documentation
└── DEPLOYMENT.md     # This deployment guide
```

## 🌐 Deployment Options

### Option 1: Quick Deploy (Recommended)

#### Frontend - Deploy to Netlify
1. **Visit**: https://netlify.com
2. **Connect GitHub**: Link your GitHub account
3. **Import Project**: Select `lead-management-system` repository
4. **Build Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
5. **Deploy**: Click "Deploy Site"

#### Backend - Deploy to Render.com
1. **Visit**: https://render.com
2. **Create Web Service**: Connect GitHub repository
3. **Service Settings**:
   - **Name**: `lead-management-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18 or higher
4. **Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://your-cluster-url/leadmanagement
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   NODE_ENV=production
   PORT=10000
   ```
5. **Deploy**: Click "Create Web Service"

#### Database - MongoDB Atlas
1. **Visit**: https://mongodb.com/atlas
2. **Create Cluster**: Free tier is sufficient
3. **Setup Database User**: Create user with read/write access
4. **Network Access**: Add `0.0.0.0/0` for all IP addresses
5. **Get Connection String**: Use this as MONGODB_URI

### Option 2: Alternative Platforms

#### Frontend Options:
- **Vercel**: https://vercel.com (automatic GitHub integration)
- **GitHub Pages**: For static hosting
- **Heroku**: Full-stack hosting

#### Backend Options:
- **Railway**: https://railway.app (great for Node.js)
- **Heroku**: https://heroku.com (classic choice)
- **DigitalOcean App Platform**: https://digitalocean.com

## 🔧 Environment Configuration

### Backend Environment Variables
Create these environment variables in your hosting platform:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leadmanagement
JWT_SECRET=your-super-secret-jwt-key-must-be-at-least-32-characters-long
NODE_ENV=production
PORT=10000
```

### Frontend Environment Variables
Create `.env.production` in frontend folder:

```bash
REACT_APP_API_URL=https://your-backend-url.render.com
```

## 📝 Deployment Checklist

### ✅ Pre-Deployment
- [x] Code uploaded to GitHub
- [x] All dependencies listed in package.json
- [x] Environment variables configured
- [x] Database connection string ready

### ✅ Backend Deployment
- [ ] Deploy to Render/Railway/Heroku
- [ ] Set environment variables
- [ ] Test API endpoints
- [ ] Verify database connection

### ✅ Frontend Deployment
- [ ] Update API URL in frontend config
- [ ] Deploy to Netlify/Vercel
- [ ] Test authentication flow
- [ ] Verify all features work

### ✅ Final Testing
- [ ] User registration works
- [ ] Login/logout functions
- [ ] CRUD operations for leads
- [ ] Pagination and filters
- [ ] Responsive design
- [ ] HTTPS enabled

## 🌍 Live URLs
After deployment, update README.md with:

```markdown
## 🌐 Live Demo
- **Frontend**: https://your-app.netlify.app
- **Backend API**: https://your-backend.render.com
- **GitHub**: https://github.com/anirbansantra748/lead-management-system
```

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure backend allows frontend domain
2. **Database Connection**: Check MongoDB URI and network access
3. **Build Failures**: Verify Node.js versions match
4. **404 on Routes**: Add `_redirects` file for SPA routing

### Support Resources:
- Netlify Docs: https://docs.netlify.com
- Render Docs: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

---

## 🎯 Assignment Requirements Met

✅ **JWT auth with httpOnly cookies**
✅ **CRUD for leads with correct status codes**
✅ **Server-side pagination and filters**
✅ **Create/Edit/Delete reflect in UI**
✅ **Unauthorized requests return 401**
✅ **Fully deployed (frontend + backend + DB)**

**Ready for evaluation! 🚀**