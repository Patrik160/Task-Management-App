# TaskFlow

A high-performance, real-time collaborative task management platform engineered for speed, security, and exceptional user experience. Developed by **Peak Global**.

---

## 🚀 Overview

TaskFlow is a modern Kanban-style productivity application that bridges the gap between clean aesthetic design and robust functional power. Built with a "Clean Utility" philosophy, it provides teams with an instantaneous synchronization engine for seamless project tracking across desktop and mobile devices.

## ✨ Key Features

* **Refined Design & Themes:** A sophisticated "Graphite & Zen" palette utilizing Zinc/Slate neutrals in light mode and deep Obsidian in dark mode to reduce eye strain.
* **Exceptional UI/UX:** Features glassmorphism effects, refined card layouts, and a "soft-tech" feel for a professional aesthetic.
* **Cross-Platform Optimization:**
    * **Mobile Sidebar:** A spring-based drawer with backdrop overlays.
    * **Responsive Modals:** Task details transition from centered dialogs on desktop to bottom-sheets on mobile for easier thumb-reach.
    * **Fluid Layouts:** Optimized horizontal scrolling for Kanban columns on smaller screens.
* **Real-Time Sync:** Powered by **Firebase Firestore**, updates to tasks and boards are reflected instantly across all connected clients.
* **Enterprise-Grade Security:** A rigorous 8-pillar security strategy implemented via Firestore Security Rules ensures strict data isolation.
* **Seamless Authentication:** Integrated Google Sign-In for friction-less onboarding.

## 🛠️ Technical Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion
* **State & Real-time:** Firebase Firestore (Region: `asia-south1`)
* **Auth:** Firebase Authentication (Google)
* **Icons & UI Components:** Lucide React, Radix UI primitives
* **Type Safety:** TypeScript

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/peak-global/taskflow.git](https://github.com/peak-global/taskflow.git)
    cd taskflow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🛡️ Security & Architecture

TaskFlow utilizes a strict security specification (`security_spec.md`) that governs all data interactions. 
* **Validation:** All incoming Firestore writes are validated against schema helpers in `src/lib/utils.ts`.
* **Code Quality:** Zero linter errors and optimized hook dependency arrays ensure stable state synchronization and production-ready performance.
* **Access Control:** Strict project-level isolation enforced at the database layer; users only access authorized boards.

---
© 2026 **Peak Global**. All rights reserved.
