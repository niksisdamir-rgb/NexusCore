# Betonska Baza Hodovo — AzVirt

**Interactive 3D Visualization & SCADA System** for the Elkonmix-90 concrete mixing plant at Betonska Baza Hodovo. Powered by the **NexusCore AI Agent Framework**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-orange)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)
[![NexusCore](https://img.shields.io/badge/Powered_by-NexusCore_AI-red)](https://github.com/niksisdamir-rgb/NexusCore)

## Overview

Elkonmix-90 is a state-of-the-art concrete plant management system featuring:
- **3D Interactive Plant Model** — Fully procedural Three.js visualization with real-time telemetry syncing.
- **NexusCore AI Engine** — Autonomous agents for recipe parsing, document extraction (OCR), and production optimization.
- **Real-time Telemetry** — SSE-based streaming of sensor data (temperatures, weights, motor speeds).
- **SCADA Monitoring System** — 11 functional modules for end-to-end plant operations.
- **Dual 3D Viewer** — Dynamic animation and exploded component inspection modes.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| 3D Engine | Three.js + React Three Fiber + Drei |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | Zustand + TanStack Query |
| Database | SQLite (Dev) / PostgreSQL (Prod) via Prisma |
| AI Engine | NexusCore (Gemini Pro / Flash) |
| Icons | Lucide React |
| Animation | Framer Motion |

## Features

### 3D Visualization
- Fully procedural 3D model (no external GLTF files)
- 12+ plant components with technical edge rendering
- Animated conveyor belts, dust particles, rotating mixer
- Quality-based rendering (Low/Medium/High)
- FPS monitoring and adaptive performance
- Rain/weather effects
- Day/night cycle
- Exploded view mode
- Component-by-component static viewer with dimension labels

### SCADA System (11 Tabs)
| Tab | Feature |
|-----|---------|
| Početna | Process flow SVG, equipment monitoring, batch controls |
| Stranice | Daily reports with print support |
| Recepti | Recipe management with xlsx import |
| Plan proizvodnje | Production planning |
| Proizvodnje | Production order CRUD |
| Otpremnice | Delivery note management with printing |
| Zalihe | Inventory management with low-stock alerts |
| Korisnici | Operator management (roles, shifts) |
| Postavke | System settings, calibration, alarm config |
| Pomoć | Help, keyboard shortcuts, system info |
| Odjava | Logout |

### Dashboard
- Production KPIs and statistics with trend analysis
- Equipment status overview (Motors, Silos, Hoppers)
- Recent activity feed and real-time alarm logs

## System Architecture

The system follows a modern decoupled architecture:
1. **Frontend**: Next.js 16 + React Three Fiber for the 3D SCADA interface.
2. **Real-time Layer**: Global Event Bus (EventEmitter) + Server-Sent Events (SSE).
3. **AI Layer**: NexusCore agents using Google Gemini for document and recipe extraction.
4. **Data Layer**: Prisma ORM with automated stock depletion logic.

Refer to [Architecture Documentation](docs/architecture.md) for details.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── scada/route.ts          # SCADA simulation + recipe CRUD
│   │   ├── scada/import/route.ts   # xlsx recipe import
│   │   ├── scada/seed/route.ts     # Database seeding
│   │   ├── productions/route.ts    # Production orders CRUD
│   │   ├── otpremmnice/route.ts    # Delivery notes CRUD
│   │   ├── inventory/route.ts      # Inventory CRUD
│   │   ├── operators/route.ts      # Operators CRUD
│   │   └── reports/route.ts        # Daily reports CRUD
│   ├── page.tsx                    # Main page (routing)
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── Elkonmix/
│   │   ├── PlantScene.tsx          # 3D scene (~8200 lines)
│   │   ├── PlantUI.tsx             # 3D viewer UI (~4900 lines)
│   │   ├── LandingPage.tsx         # Landing page (~1000 lines)
│   │   ├── Dashboard.tsx           # Dashboard (~2000 lines)
│   │   ├── ScadaSystem.tsx         # SCADA system (~4300 lines)
│   │   ├── StaticViewer.tsx        # Static 3D viewer (~1600 lines)
│   │   └── specs.ts                # Equipment specifications
│   └── ui/                         # shadcn/ui components
├── hooks/                          # Custom React hooks
└── lib/
    ├── db.ts                       # Prisma database client
    └── utils.ts                    # Utility functions
prisma/
└── schema.prisma                   # Database schema
```

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- SQLite3

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/betonska-baza-hodovo.git
cd betonska-baza-hodovo

# 2. Install dependencies
npm install  # or bun install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY and NEXTAUTH_SECRET

# 4. Set up database
npx prisma migrate dev --name init
npx prisma db seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

- [Operator User Manual (Bosanski)](docs/MANUAL.md)
- [System Architecture](docs/architecture.md)
- [NexusCore Framework](https://github.com/niksisdamir-rgb/NexusCore)

## Language

All UI text is in **Bosnian** (Bosanski jezik) as the plant is located in Hodovo, Bosnia and Herzegovina.

## License

Proprietary — AzVirt d.o.o.

---

Built with Next.js, Three.js, and Tailwind CSS.
