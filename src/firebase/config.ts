import { initializeApp, getApps } from "firebase/app";

// This is a public object, so it's safe to expose.
// Security is handled by Firebase Security Rules and App Check.
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID",
};

// Initialize Firebase
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// IMPORTANT: As an AI, I cannot replace these values for you.
// You must get your own Firebase project configuration object
// and replace the placeholder values above.
