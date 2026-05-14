# TaskFlow

**TaskFlow** is a high-performance, real-time collaborative task management application designed for speed and clarity. It features a responsive Kanban-style interface and seamless data synchronization across all users.

## 🚀 Features

* **Real-time Collaboration**: Instant updates across all clients using Firebase Firestore listeners.
* **Intuitive Kanban Board**: Drag-and-drop tasks between "To Do," "In Progress," and "Done" columns.
* **Secure Authentication**: Integrated Google Sign-In for quick and secure user onboarding.
* **Responsive UI/UX**: A "Clean Utility" aesthetic built with Tailwind CSS, featuring a collapsible sidebar and fluid layouts.
* **Granular Task Control**: Assign priorities (Low, Medium, High) and track due dates.

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite, Framer Motion, Lucide React, Tailwind CSS.
* **Backend**: Firebase (Authentication & Firestore).
* **State Management**: Real-time sync via Firestore snapshots and React hooks.

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd taskflow
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## 🛡️ Security

The application utilizes a rigorous 8-pillar security strategy implemented via **Firestore Security Rules**. This ensures:
* Users can only access boards they are authorized to view.
* Data integrity is maintained through strict schema validation.
* Unauthorized "shadow" updates or orphaned data entries are blocked.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
