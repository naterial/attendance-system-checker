# Vibrant Aging Community Centre - Attendance System

This is a Next.js application built with Firebase and Genkit that serves as a staff attendance system for the Vibrant Aging Community Centre. It features a QR code-based sign-in flow, an admin approval system, and an AI-powered daily summary of staff notes.

## Key Features

- **QR Code Sign-In**: Workers scan a QR code to begin the attendance process.
- **PIN Authentication**: Secure 4-digit PIN for each worker to complete sign-in.
- **Admin Approval Workflow**: Admins review, approve, or reject attendance submissions from a secure dashboard.
- **Real-time Updates**: The attendance log on the homepage updates in real-time.
- **AI Daily Summary**: Admins can generate an AI-powered summary of all approved staff notes for any given day.
- **Worker Management**: Admins can add, edit, and delete workers.
- **PDF Export**: Export approved attendance records as a PDF.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **AI/Generative**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models
- **UI**: [ShadCN UI](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: Firebase App Hosting (or Vercel)

---

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [pnpm](https://pnpm.io/installation) (or npm/yarn)

### 2. Set Up Firebase

1. Create a project on the [Firebase Console](https://console.firebase.google.com/).
2. Create a **Web App** in your project settings to get your Firebase config keys.
3. Enable **Cloud Firestore** and create a database.
4. Set up Firestore Security Rules. You can use the `firestore.rules` file in this repository as a starting point.

### 3. Set Up Google AI

1. Go to the [Google AI Studio](https://aistudio.google.com/).
2. Create a new API key for the Gemini API.

### 4. Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <repository-name>
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   - Copy the `.env.example` file to a new file named `.env`.
   - Fill in the values for your Firebase project and your Gemini API key.
   ```bash
   cp .env.example .env
   ```

### 5. Running the Development Server

You can start the development server with:

```bash
pnpm dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

---

## Available Pages

- **`/`**: The homepage with the real-time attendance log and sign-in button.
- **`/scan`**: The QR code scanning page for workers.
- **`/attendance`**: The PIN entry and notes submission page.
- **`/admin`**: The admin dashboard for managing workers and approving attendance.
- **`/admin/login`**: The login page for administrators.
