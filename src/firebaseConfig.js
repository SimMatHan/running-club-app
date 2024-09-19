import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCPwtX5s7d2ZwlS_kSsdnvo16sruPwVdo",
  authDomain: "club-send-it.firebaseapp.com",
  projectId: "club-send-it",
  storageBucket: "club-send-it.appspot.com",
  messagingSenderId: "491071977636",
  appId: "1:491071977636:web:68e8660f291303dca2ce31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
