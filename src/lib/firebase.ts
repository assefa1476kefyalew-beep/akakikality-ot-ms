import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBEFUwEVQxGsc3rAdALDHl450wqlVE7JzI",
  authDomain: "akakimesob-ot-attendance.firebaseapp.com",
  projectId: "akakimesob-ot-attendance",
  storageBucket: "akakimesob-ot-attendance.firebasestorage.app",
  messagingSenderId: "150232061708",
  appId: "1:150232061708:web:39c49265a8a44340825b29",
  measurementId: "G-NR225FQMS9"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
