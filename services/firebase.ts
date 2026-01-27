
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

/**
 * Sécurise les données pour Firestore.
 * Au lieu de supprimer les champs 'undefined' (ce qui pourrait masquer des manques),
 * nous les transformons en 'null'. Firestore accepte 'null' comme type de valeur.
 * Cela permet de garder une structure de document constante et prévisible.
 */
export const sanitizeFirestoreData = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  
  if (Array.isArray(obj)) {
    return obj.map(v => sanitizeFirestoreData(v));
  }
  
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeFirestoreData(value);
    }
    return sanitized;
  }
  
  return obj;
};
