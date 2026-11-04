import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Replace these values with your Firebase Web App config if you use a different project.
const firebaseConfig = {
  apiKey: "AIzaSyApM2s8G7-5H_DMXJ-aNr4clCKILlsTy7s",
  authDomain: "pinoybite-b8478.firebaseapp.com",
  projectId: "pinoybite-b8478",
  storageBucket: "pinoybite-b8478.firebasestorage.app",
  messagingSenderId: "1078893870748",
  appId: "1:1078893870748:web:ca86b111a19bde0c1cf759",
  measurementId: "G-P1ZS53Q7T3"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
const db = getFirestore(app);

export const firebaseReady = () => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const getFirebaseServices = async () => ({
  auth,
  googleProvider,
  signInWithPopup,
  db,
  doc,
  setDoc
});

export { app, auth, googleProvider, db };
export default app;
