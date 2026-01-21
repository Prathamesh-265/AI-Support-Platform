# AI Support Platform — AI-Powered Customer Support Chat (MERN + LLM + Knowledge Base)

A full-stack AI-powered customer support chat platform built with the **MERN stack**.  
It provides a modern Chat UI, secure authentication, role-based access, chat history persistence, and an Admin Dashboard to upload knowledge base documents (PDF/TXT) to ground AI responses.

This project demonstrates how real-world support systems integrate **LLMs (Gemini / OpenAI / Groq)** with company-specific context.

---

## Features

### ✅ User Features
- Secure authentication using **JWT**
- Clean, responsive **Chat UI**
- Context-aware AI responses (conversation memory)
- Chat history persistence (MongoDB)
- Clear chat functionality

### ✅ Admin Features
- Role-based access (`admin`)
- Upload knowledge base documents (`PDF`, `TXT`)
- List and delete uploaded docs
- AI grounding using uploaded company documents (FAQs / manuals / policy docs)

### ✅ AI Integration
- Supports:
  - **Gemini (Google Generative AI)**
  - **OpenAI**
  - **Groq**
- Provider selection using environment variables
- Auto fallback mode supported:
  - `AI_PROVIDER=auto` (tries Gemini → OpenAI → Groq)

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- React Markdown (AI response formatting)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer file uploads
- AI integration service layer

---

## Project Structure

```bash
ai-support-platform/
├── server/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # Auth, Chat, Document controllers
│   │   ├── middlewares/    # JWT middleware, error handler
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── services/       # AI + ingestion logic
│   │   ├── utils/          # ApiResponse, asyncHandler etc.
│   ├── uploads/            # Uploaded documents storage
│   ├── index.js
│   └── .env
├── client/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Login, Register, Chat, AdminDashboard
│   │   ├── services/       # API service functions
│   │   ├── context/        # Auth context
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── tailwind.config.js
└── README.md
