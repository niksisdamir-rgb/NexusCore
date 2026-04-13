# Betonska Baza Hodovo — AzVirt

**Interactive 3D Visualization & SCADA System** for the Elkomix-90 concrete mixing plant at Betonska Baza Hodovo, AzVirt d.o.o.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-orange)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)

## Overview

A comprehensive web application featuring:
- **3D Interactive Plant Model** — Fully procedural Three.js visualization of the Elkomix-90 concrete plant with real proportions and technical drawing aesthetics
- **SCADA Monitoring System** — Real-time plant simulation with 11 functional tabs including production management, delivery notes, recipes, inventory, and operator management
- **Dashboard** — Key performance indicators, production statistics, and system monitoring
- **Dual 3D Viewer** — Both dynamic (animated) and static (component-by-component) 3D inspection modes

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| 3D Engine | Three.js + React Three Fiber + Drei |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | Zustand + TanStack Query |
| Database | SQLite via Prisma ORM |
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
- Production KPIs and statistics
- Equipment status overview
- Recent activity feed

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
│   ├── elkomix/
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
# Clone the repository
git clone https://github.com/YOUR_USERNAME/betonska-baza-hodovo.git
cd betonska-baza-hodovo

# Install dependencies
bun install

# Set up database
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Seeding

```bash
curl -X POST http://localhost:3000/api/scada/seed
```

## Language

All UI text is in **Bosnian** (Bosanski jezik) as the plant is located in Hodovo, Bosnia and Herzegovina.

## License

Proprietary — AzVirt d.o.o.

---

Built with Next.js, Three.js, and Tailwind CSS.
