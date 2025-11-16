# Real-Time Chat Application

A real-time chat application built with React and Firebase. Users can create channels, send messages, and manage conversations.

## Features

- User authentication (email/password)
- Create and join channels
- Real-time messaging
- User search functionality
- Channel management (owner can remove members or delete channel)
- Member list for each channel

## Tech Stack

- React + TypeScript + Vite
- Firebase (Authentication + Firestore + react-firebase-hooks)
- Redux Toolkit (I know its too big for a little chat)
- Tailwind CSS

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

Create `.env` file in root directory look at `.env.example`

### 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /channels/{channelId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null &&
                       request.auth.uid == resource.data.creatorId;

      match /messages/{messageId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null &&
                         request.auth.uid in get(/databases/$(database)/documents/channels/$(channelId)).data.members;
      }
    }
  }
}
```

### 4. Run Application

```bash
npm run dev
```

Application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/chat/     # Chat components
├── pages/              # Main pages
├── config/             # Firebase configuration
├── app/                # Redux store
├── features/           # Redux slices
└── types/              # TypeScript definitions
```

### Authentication

Register with email, password, and nickname. Login with existing credentials.
