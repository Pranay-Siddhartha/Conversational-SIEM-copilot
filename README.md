# 🛡️ Conversational SIEM Copilot

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Cloud-orange?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Tailwind 4](https://img.shields.io/badge/UI-Tailwind%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

An advanced, **AI-powered Security Operations Center (SOC) Assistant** designed to simplify threat detection, investigation, and response through a natural language interface. Instead of complex SQL queries or regex, simply **ask your SIEM** who's attacking you.

---

## 🔥 Key Features

- **🌐 Conversational Threat Analysis**: Ask questions like *"Who's attacking me from Russia?"* or *"Summarize the last 24 hours of firewall logs."*
- **⏳ Multi-Incident Timeline**: A sophisticated UI that groups suspicious events into **Attack Chains**, allowing you to track multiple threat actors simultaneously.
- **🔮 Predictive Intelligence**: AI forecasts the attacker's next move based on current behavior and MITRE ATT&CK patterns.
- **📈 Real-time Analytics**: Dynamic dashboard with interactive charts visualizing attack volume, success rates, and geographic distribution.
- **⚡ Blazing Fast Inference**: Integration with **Groq LPU™** technology for near-instant log analysis and narrative generation.
- **🎨 Cybernetic UX**: A premium, glassmorphic dark-themed interface built for modern security teams.

---

## 🏗️ Architecture

The project consists of three main components:

1.  **Frontend**: Next.js 15+ with TailwindCSS 4 and Framer Motion for premium animations.
2.  **Backend**: FastAPI (Python) handling log ingestion, SQL generation, and AI orchestration.
3.  **Database**: PostgreSQL for persistent log storage and SQLite for lightweight local development.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+**
- **Python 3.12+**
- **Docker & Docker Compose** (Optional, for database)
- **Groq API Key** (or OpenAI/Gemini)

---

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

**Configuration**: Create a `.env` file in the `backend` folder:
```env
DATABASE_URL=postgresql://siem_user:siem_password@localhost:5432/siem_copilot
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
```

**Run Server**:
```bash
python -m uvicorn app.main:app --reload
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
```

**Configuration**: Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Run Development Server**:
```bash
npm run dev
```

---

### 3. Docker (Alternative)

To spin up the Postgres database only:
```bash
docker-compose up -d
```

---

## 📊 Project Structure

```bash
Conversational-SIEM-Assisstant/
├── backend/            # FastAPI Project
│   ├── app/            # Main logic & Routers
│   ├── sample_logs/    # JSON/Log samples for testing
│   └── .env            # Environment config (Private)
├── frontend/           # Next.js Application
│   ├── src/app/        # App Router pages
│   ├── components/     # UI Design System
│   └── public/         # Static assets
├── docker-compose.yml  # Database orchestration
└── README.md           # You are here!
```

---

## 🛡️ Security & Privacy
The SIEM Copilot is designed with data privacy in mind. Sensitive fields can be masked before being sent to the AI providers, ensuring your metadata remains secure.

---

*Built with ❤️ for the Smart India Hackathon (SIH).*
