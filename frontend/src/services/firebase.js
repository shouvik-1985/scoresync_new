// frontend/src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDM4P96ZUTRn-unirz1fZVRPJNByMAWdAc",  // from .env FIREBASE_WEB_API_KEY
  authDomain: "scoresync-3ce4c.firebaseapp.com",      // static or custom domain if configured
  projectId: "scoresync-3ce4c",
  storageBucket: "scoresync-3ce4c.appspot.com",       // from .env FIREBASE_STORAGE_BUCKET
  //messagingSenderId: "1234567890",                    // optional: fill if needed
  //appId: "1:1234567890:web:abcdef123456"              // optional: fill if needed
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
