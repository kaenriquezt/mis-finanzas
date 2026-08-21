import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD_fGP0NGFyoDZIP6uujj43qF-fu25ZfuI",
  authDomain: "mis-finanzas-c94de.firebaseapp.com",
  projectId: "mis-finanzas-c94de",
  storageBucket: "mis-finanzas-c94de.firebasestorage.app",
  messagingSenderId: "984054722000",
  appId: "1:984054722000:web:9ea9fabf7c59fc5b4a9dd5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
