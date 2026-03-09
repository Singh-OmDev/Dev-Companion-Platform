# 🚀 Dev Companion Platform (DevOS)

<img width="1911" height="868" alt="image" src="https://github.com/user-attachments/assets/7be4664c-42f9-40da-8e36-b55351408a25" />


![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)

Dev Companion Platform (also known as DevOS) is a modern, AI-powered central command center designed for developers. It enhances productivity by converging task tracking, Leetcode practice recommendations, dynamic architectures, daily standup generation, and real-time github statistics into one cohesive, interactive dashboard.

## ✨ Key Features

- **🤖 AI-Powered Insights:** Integrated with Groq & Google Generative AI to generate daily missions, standup reports, and smart recommendations.
- **🖥️ DevOS Command Center:** Real-time dashboard with dynamic metrics, GitHub tracking, and interactive visualizations using Recharts and React Flow.
- **🛡️ Secure Authentication:** Seamless user login and secure session management powered by Clerk and GitHub OAuth.
- **📚 LeetCode Tracking:** Get tailored LeetCode problem recommendations directly inside your dashboard.
- **🗺️ Interactive Flow Architecture:** Visual node-based repository tracking and visualization tools built with React Flow.
- **🎨 Modern UI/UX:** Responsive, dark-mode native interface styled gracefully with Tailwind CSS and Framer Motion animations.

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS, Framer Motion, Lucide React
- **State Management:** Zustand
- **Routing:** React Router v7
- **Visualizations/Flows:** Recharts, React Flow (xyflow)
- **Authentication:** Clerk React
- **Utilities:** Axios, HTML2Canvas, jsPDF

### Backend (Server)
- **Environment:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Authentication:** Clerk Node SDK, Passport.js, JWT, bcryptjs
- **AI Integrations:** Groq SDK, Google Generative AI
- **Utilities:** Node-Cron (scheduled tasks), Multer (file uploads), PDF-Parse

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) account and cluster
- [Clerk](https://clerk.com/) account (for authentication)
- API Keys for Groq / Google Generative AI

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/dev-companion-platform.git
   cd dev-companion-platform
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   ```
   *Create a `.env` file in the `server` directory using `.env.example` as a template and provide your `MONGO_URI`, `CLERK_SECRET_KEY`, `GROQ_API_KEY`, etc.*

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   ```
   *Create a `.env` file in the `client` directory and configure your `VITE_CLERK_PUBLISHABLE_KEY`.*

### Running the Application

Open two terminal windows to run both the client and server concurrently.

**Start the Server:**
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

**Start the Client:**
```bash
cd client
npm run dev
# Vite runs the client (typically on http://localhost:5173)
```

## 📂 Project Structure

```
dev-companion-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── modules/        # Feature modules (LeetCode, Standup, etc.)
│   │   ├── stores/         # Zustand state configuration
│   │   └── App.jsx
│   └── package.json
└── server/                 # Node.js backend
    ├── index.js            # Express entry point
    ├── models/             # Mongoose schemas
    ├── routes/             # API routing
    └── package.json
```

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
