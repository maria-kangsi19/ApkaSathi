# ApkaSathi

A companion app designed for elderly people living with dementia, built to support patients, caregivers, and family members with daily routines, memory support, and connection.

**Live demo:** https://apka-sathi.vercel.app

## Features
- Separate flows/dashboards for **patients** and **caregivers**
- Cognitive exercises and memory-support activities (e.g. "Familiar Places," "Sounds of Home")
- Caregiver tools: activity log, reminders, media hub, and a "support circle" for coordinating family/caregivers
- Role selection and onboarding with a disclaimer modal
- AI-assisted features via the Google GenAI SDK

## Tech Stack
- React 19 + TypeScript
- Vite (build tool)
- Express + `tsx` (lightweight Node server, see `server.ts`)
- Tailwind CSS
- `@google/genai` for AI features
- Framer Motion (`motion`) for animation, `canvas-confetti` for celebratory UI moments

## Project Structure
```
ApkaSathi/
├── index.html
├── server.ts              # Express server entry point
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── caregiver/      # Caregiver dashboard, reminders, media hub, support circle
│   │   ├── patient/        # Patient-facing activities and exercises
│   │   └── common/         # Shared components (header, role selection, disclaimer)
│   └── assets/
├── public/
├── data/db.json            # Local/dev data store
└── package.json
```

## Getting Started
```bash
git clone https://github.com/maria-kangsi19/ApkaSathi.git
cd ApkaSathi
npm install         # or bun install
cp .env.example .env   # add any required API keys (e.g. Google GenAI)

npm run dev          # start dev server
npm run build         # production build
npm start             # run built server
```

## Notes
This project touches a sensitive use case (care for people with dementia) — see `DisclaimerModal.tsx` for the in-app disclaimer shown to users.
