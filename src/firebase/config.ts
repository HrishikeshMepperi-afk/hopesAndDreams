import { initializeApp, getApps } from "firebase/app";

// This is a public object, so it's safe to expose.
// Security is handled by Firebase Security Rules and App Check.
const firebaseConfig = {
  "projectId": "studio-9847488427-e2c0c",
  "appId": "1:1001544693133:web:6ab4edf5d3311c6310f9c4",
  "storageBucket": "studio-9847488427-e2c0c.firebasestorage.app",
  "apiKey": "AIzaSyD0xD8bq-sjtiWsedlK5pHJ-xzdwho36ac",
  "authDomain": "studio-9847488427-e2c0c.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1001544693133"
};

// Initialize Firebase
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
