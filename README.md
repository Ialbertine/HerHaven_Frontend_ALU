# HerHaven Frontend

<div align="center">

  ### A Safe Haven for Healing and Support
</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

---

## About

**[HerHaven](https://ialbertine-herhaven.netlify.app/)** is a culturally sensitive, trauma-informed digital space designed to support women affected by gender-based violence. It offers confidential access to mental health care through professional counseling links, peer-to-peer support, and an AI-guided chatbot providing psychoeducation, self-help tools, and crisis referrals—promoting healing, resilience, and stigma-free help-seeking.

### Mission

To create a safe, accessible, and empowering digital platform that breaks the silence around gender-based violence and connects survivors with the resources they need to heal and thrive.

---

### URLs

- Backend Repository: https://github.com/Ialbertine/HerHaven_Backend_ALU  

- Backend API: https://ialbertine-herhaven-backend.onrender.com

you will need to add Routes accordingly

- 

## ✨ Features

- **Secure Authentication** - Role-based access control with JWT authentication and integrated continue as guest option to support confidential
- **Multi-Role Dashboard** - Separate interfaces for Users, and Admins
- **AI-Guided Support** - Intelligent chatbot for psychoeducation and crisis support
- **Peer-to-Peer Support** - Safe community spaces for sharing and healing
- **Professional Counseling** - Direct links to verified mental health professionals
- **Responsive Design** - Seamless experience across all devices
- **Modern UI/UX** - Beautiful, intuitive interface with smooth animations
- **Privacy First** - End-to-end encryption and confidential interactions
- **Culturally Sensitive** - Designed with cultural awareness and inclusivity

---

## 🛠️ Tech Stack

### Core Technologies

- **React** - Modern UI library with latest features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **React Router DOM** - Client-side routing

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **React Icons** - Additional icon sets
- **DM Sans Font** - Clean, modern typography

### State Management & API

- **Axios** - HTTP client for API requests
- **React Hot Toast** - Elegant notifications

### Development Tools

- **ESLint** - Code linting and quality
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite React Plugin** - Optimized React development

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** - [Download](https://git-scm.com/)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Ialbertine/HerHaven_Frontend_ALU.git
cd HerHaven_Frontend_ALU
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```
---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_REACT_API_URL=http://localhost:5000/api or deployed URL
MONGO_URI= your url 
JWT_SECRET=your secret key

```

### Backend API

Ensure your backend API is running and accessible. Update the `VITE_API_BASE_URL` to point to your backend server.

---

## 🏃‍♀️ Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

---

## User Roles

The application supports three distinct user roles:

### 1. **User (Survivor/Seeker)**

- Access to support resources
- AI chatbot interaction
- Peer-to-peer support forums
- Counselor connection
- Personal dashboard

- **continue as guest**: will be accessing the limited feature on the user

### 2. **counselors**

- all user appointment
- Communication tools
- Professional dashboard

### 3. **Admin**

- User management
- Content moderation
- Analytics and reporting
- System configuration
- Full platform oversight

---

## Available Scripts

- `npm run dev`: Start development server 
- `npm run build`: Build for production   
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint for code quality 

---

## Deployment

### Netlify (Recommended)

1. Connect your repository to Netlify
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
3. Add environment variables in Netlify dashboard
4. Deploy!

The `_redirects` file is already configured for SPA routing.
---

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use functional components with hooks
- Write meaningful commit messages
- Add comments for complex logic
- Ensure all tests pass before submitting

---


<div align="center">
  <p><strong>Together, we create safe spaces for healing</strong></p>
</div>
