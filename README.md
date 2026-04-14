# 🛡️ Conversational SIEM Copilot

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Cloud-orange?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Tailwind 4](https://img.shields.io/badge/UI-Tailwind%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

An advanced, **AI-powered Security Operations Center (SOC) Assistant** designed to simplify threat detection, investigation, and response through a natural language interface.

---

## 🔥 Key Features

- **🌐 Conversational Threat Analysis**: Ask questions like *"Who's attacking me from Russia?"*
- **⏳ Multi-Incident Timeline**: Track multiple threat actors with sophisicated Attack Chains.
- **🔮 Predictive Intelligence**: AI forecasts attacker's next moves based on MITRE ATT&CK.
- **📈 Real-time Analytics**: Dynamic dashboard with interactive charts and threat maps.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js 20+**
- **Python 3.12+**

### 1. Setup & Installation
```bash
# Install Node dependencies
npm install

# Setup Python environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configuration
Create a `.env` file in the root:
```env
DATABASE_URL=sqlite:///./siem_copilot.db
GROQ_API_KEY=your_key_here
```

### 3. Run Development
```bash
# Frontend
npm run dev

# Backend (separate terminal)
python -m uvicorn api.index:app --reload --port 8000
```

---

## ☁️ Vercel Deployment

This project is optimized for Vercel with a standard root-level layout.

> [!IMPORTANT]
> **Project Settings on Vercel**:
> - **Framework Preset**: `Next.js`
> - **Root Directory**: `.` (Repository root)

The Python API in the `api/` directory is automatically detected and served as serverless functions.

---

## 📊 Project Structure

```bash
Conversational-SIEM-copilot/
├── api/                # Python Serverless Functions (Vercel)
├── backend/            # Shared Backend Logic & Services
├── src/                # Next.js Frontend Source
├── public/             # Static Assets
├── requirements.txt    # Python Dependencies
├── package.json        # Frontend Dependencies
└── vercel.json         # Vercel Routing Configuration
```

---

*Built with ❤️ for the Smart India Hackathon (SIH).*
