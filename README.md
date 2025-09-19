# 🚀 Lead Management System

> **A modern, full-stack Lead Management System built by Anirban Santra**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://lead-management-system-i2k5-git-main-anirbansantra748s-projects.vercel.app?_vercel_share=9ROXxYz1bfpvXJnoOUPb69jOE0WDqwLk)
[![Backend API](https://img.shields.io/badge/API-Live-green?style=for-the-badge)](https://lead-management-system-wlg0.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge)](https://github.com/anirbansantra748/lead-management-system)

## 🌐 Live Application

**🎯 Try it now:**  
👉 [Frontend (Vercel)](https://lead-management-system-i2k5-git-main-anirbansantra748s-projects.vercel.app?_vercel_share=9ROXxYz1bfpvXJnoOUPb69jOE0WDqwLk)  
👉 [Backend (Render)](https://lead-management-system-wlg0.onrender.com)

### 🔑 Test Credentials
```
Email: test@example.com
Password: password123
```

---

Hey there! 👋 This is my Lead Management System - a complete full-stack application that I built for the **Erino SDE Internship Assignment**. It's got everything you need to manage leads like a pro, with some seriously cool features under the hood!

## ✨ What Makes This Special?

I didn't just build another CRUD app - I crafted something that actually solves real business problems! Here's what sets this apart:

🔐 **Security First**: JWT with httpOnly cookies (because localStorage is for amateurs)  
⚡ **Performance**: Server-side pagination & filtering (your browser will thank you)  
🎨 **Professional UI**: AG Grid with Material-UI (looks like it costs $1000/month)  
🚀 **Production Ready**: Deployed and battle-tested (click the link above!)  
📱 **Responsive**: Works perfectly on your phone, tablet, or that ancient laptop  

## 🚀 Features

### Authentication
- **JWT Authentication** with httpOnly cookies (no localStorage)
- User registration and login with validation
- Password hashing with bcrypt
- Secure logout functionality
- Protected routes with 401 error handling

### Lead Management
- **Complete CRUD Operations** (Create, Read, Update, Delete)
- **Server-side Pagination** with configurable page size
- **Advanced Filtering** with multiple operators:
  - String fields: equals, contains
  - Enums: equals, in
  - Numbers: equals, gt, lt, between
  - Dates: on, before, after, between
  - Boolean: equals

### UI/UX
- **AG Grid** for data visualization with infinite scrolling
- **Material-UI** components for consistent design
- **Responsive design** for all screen sizes
- **Form validation** with React Hook Form and Yup
- **Toast notifications** for user feedback
- **Loading states** and error handling

### Lead Fields
- Basic Info: first_name, last_name, email, phone
- Company Info: company, city, state
- Lead Classification: source, status, score, lead_value
- Tracking: last_activity_at, is_qualified, created_at, updated_at

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **express-validator** for input validation
- **helmet** for security headers
- **rate limiting** for API protection

### Frontend
- **React 18** with TypeScript
- **Material-UI** for UI components
- **AG Grid** for data tables
- **React Hook Form** with Yup validation
- **Axios** for API calls
- **React Router** for navigation
- **React Toastify** for notifications

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/leadmanagement

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-here

# Environment
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Server Port
PORT=5000
```

5. Start the server:
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
GENERATE_SOURCEMAP=false
```

5. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 🗄️ Database Seeding

To populate the database with test data (100+ leads), run:

```bash
cd backend
npm run seed
```

This will create:
- 1 test user with credentials:
  - **Email**: test@example.com
  - **Password**: password123
- 120 sample leads with varied data

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Leads
- `POST /api/leads` - Create new lead
- `GET /api/leads` - Get leads with pagination and filters
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/leads/stats/summary` - Get lead statistics

### Filtering Examples

Get leads with pagination:
```
GET /api/leads?page=1&limit=20
```

Filter by status:
```
GET /api/leads?filters={"status":{"equals":"qualified"}}
```

Filter by score range:
```
GET /api/leads?filters={"score":{"between":[70,100]}}
```

Filter by company name (contains):
```
GET /api/leads?filters={"company":{"contains":"Tech"}}
```

Sort by created date:
```
GET /api/leads?sort={"created_at":-1}
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. **Create a MongoDB Atlas cluster** and get the connection string

2. **Deploy to Railway**:
   - Connect your GitHub repository
   - Set environment variables:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=your-production-jwt-secret
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-domain.vercel.app
     ```

3. **Deploy to Render** (Alternative):
   - Create a new Web Service
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**:
   - Connect your GitHub repository
   - Set framework preset to "Create React App"
   - Set environment variables:
     ```
     REACT_APP_API_URL=https://your-backend-domain.railway.app/api
     ```

2. **Build configuration**:
   - Build command: `npm run build`
   - Output directory: `build`

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] User can register with valid data
- [ ] User cannot register with invalid/duplicate email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong credentials
- [ ] User stays logged in after page refresh
- [ ] User can logout successfully
- [ ] Unauthorized requests return 401

#### Lead Management
- [ ] User can view leads list with pagination
- [ ] User can filter leads by various criteria
- [ ] User can sort leads by different columns
- [ ] User can create new lead
- [ ] User can edit existing lead
- [ ] User can delete lead
- [ ] Changes reflect immediately in UI
- [ ] Form validation works correctly

#### UI/UX
- [ ] App is responsive on mobile devices
- [ ] Loading states are shown appropriately
- [ ] Error messages are user-friendly
- [ ] Toast notifications appear for actions
- [ ] Navigation works correctly

## 📋 Requirements Fulfilled

✅ **JWT auth with httpOnly cookies** - No localStorage used  
✅ **CRUD for leads** - All operations with correct status codes  
✅ **Server-side pagination and filters** - Advanced filtering system  
✅ **Create/Edit/Delete reflect in UI** - Real-time updates  
✅ **Unauthorized requests return 401** - Proper error handling  
✅ **Fully deployed** - Both frontend and backend hosted  

## 🎯 Test Credentials

**Email**: test@example.com  
**Password**: password123

The system comes pre-loaded with 120+ sample leads for testing.

## 📝 Project Structure

```
lead-management-system/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── scripts/         # Database seeding
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # Context providers
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.tsx      # Main app component
│   └── public/
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💼 About This Project

This Lead Management System was built as part of the **Erino SDE Internship Assignment** - and honestly, I had a blast building it! 🎉

What started as an assignment turned into me getting completely absorbed in creating something genuinely useful. I spent way more time than I needed to, but that's because I believe in doing things right, not just doing them.

### 🏆 What I Learned
- How to build secure, production-ready authentication
- Server-side filtering that actually scales 
- Making APIs that don't suck
- UI/UX that doesn't make users cry
- Deploying stuff that actually works in the real world

### 🛠️ Technical Highlights
- **Zero localStorage usage** (security isn't optional)
- **Advanced filtering system** (because basic search is boring)
- **Real-time UI updates** (because waiting for page refresh is painful)
- **Professional-grade deployment** (it's not just "works on my machine")

---

**Built with ❤️ by Anirban Santra**  
💫 *"Building cool stuff, one commit at a time"*  

🔗 **Connect with me:**  
[![GitHub](https://img.shields.io/badge/GitHub-anirbansantra748-black?style=flat&logo=github)](https://github.com/anirbansantra748)  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://linkedin.com/in/anirban-santra)  

*P.S. - If you're from Erino and reading this, I hope you like what you see! I'm ready to bring this same energy to your team. 🚀*
