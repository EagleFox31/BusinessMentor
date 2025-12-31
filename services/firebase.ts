
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Les clés seront injectées via process.env.FIREBASE_CONFIG si disponible, 
// sinon utilisez un objet de configuration standard.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBCOQebW1kIlPfN0giNjA70G5Rf0XONVtM",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "apexhorus-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "apexhorus-app",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "apexhorus-app.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "723302476266",
  appId: process.env.FIREBASE_APP_ID || "1:723302476266:web:f1cfa9da2f49c22460aa93"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
