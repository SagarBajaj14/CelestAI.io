# 🌟 CelestAI.io

An AI-powered chatbot that delivers personalized astrological insights and predictions based on user-provided birth details (date, time, place). Built with a modern full-stack architecture using Next.js, FastAPI, Supabase, and integrated astrology + LLM APIs.

## 🧩 Table of Contents

## 🧩 Table of Contents

1. Features
2. Architecture
3. Tech Stack
4. Getting Started
   - Prerequisites
   - Installation
5. Configuration
6. API Integration
   - Astrology Data API
   - LLM Interpretation API
7. Database Schema
8. Deployment
9. Demo


---

## 🌠 Features

- **Chat Interface**: Interactive chat UI with input for birth date, time, and place, plus free-form user questions.
- **Daily Horoscope**: Generates personalized daily horoscopes.
- **Compatibility Check**: Matches two birth profiles for astrological compatibility.
- **Personalized Insights**: Provides interpretations based on the natal chart.
- **Query History**: Stores questions, responses, and astrological data for future reference.

---

## 🏗 Architecture

```text
┌───────────────┐       ┌─────────────┐       ┌───────────────┐
|   Frontend    | <───> |   Backend   | <───> |   Database    |
| (Next.js +    |       | (FastAPI +  |       | (Supabase)    |
|  Framer Motion)|      |  Pydantic)  |       |               |
└───────────────┘       └─────────────┘       └───────────────┘
        ↓                       ↓                    ↓
        ↳ Astrology API         ↳ LLM API             ↳ Storage & Logs

```

## 🧰 Tech Stack

| Layer       | Technology                                                                 |
|-------------|----------------------------------------------------------------------------|
| **Frontend**| [Next.js](https://nextjs.org), [React](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com), [Python](https://www.python.org), [Pydantic](https://docs.pydantic.dev), [VedAstro](https://vedastro.org/), [Groq API](https://console.groq.com/home) |
| **Database**| [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage)               |
| **Deployment** | [Vercel](https://vercel.com) (Frontend)
| **CI/CD**   | [GitHub Actions](https://github.com/features/actions)                      |

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js v16 or later
- Python 3.9+
- Supabase CLI
- VedAstro API key 
- Groq API key

### 📦 Installation

#### 1. Clone the repository

```bash
git clone https://github.com/SagarBajaj14/CelestAI.io.git
cd CelestAI.io
```
#### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or use `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```
#### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

## ⚙️ Configuration

### Backend .env
```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GROQ_API_KEY
VEDASTRO_API_BASE
```

### Frontend .env
```bash
NEXT_PUBLIC_API_BASE_URL
````

## 🔌API Integration

### 🌌 Astrology API

#### Provider: VedAstro

#### Endpoints:

 - /register_user: Registers the user with user id
 - /get_user: Retrieves the info of user
 - /generate_chart: Generates astrological chart for the user
 - /daily_horoscope: Provide daily horoscope to the user
 - /personalized_insights: Provides tailored insights based on position of stars and houses
 - /ask_astrologer: Personalized chatbot for queries

<img src="https://github.com/user-attachments/assets/fa37e5cd-6325-4b6a-b185-746b652f5bb3" width="500" />

### Link to the API Exposed via Huggingface - https://lostguy14-celestai.hf.space/docs

### 🧠 LLM API (Groq)
- Model: Llama
- Purpose: Interprets raw astrological data and provides human-like responses.

## 🗃 Database Schema ( Supabase Tables )

<img src="https://github.com/user-attachments/assets/f03c6f81-1ef5-4ed8-8139-86a62547d99b" width="500" />

## 🚢 Deployment

### Vercel (Frontend)
- Push your frontend code to GitHub.
- Connect the repo on Vercel.
- Set environment variables in project settings.
- Click Deploy.

### Hugginface (Backend)
- Upload the backend project to huggingface spaces
- Test the public api built

### Link to Live Website: https://celestai-sigma.vercel.app/

## 🎥 Demo

- Check out the live demo video showcasing the chatbot in action: 
