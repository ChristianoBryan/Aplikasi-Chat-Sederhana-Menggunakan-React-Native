import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { collection, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDA5XU44ZZLt3DGq4iSvBVddDZPzWbv7o8",
  authDomain: "chatapp-18dd4.firebaseapp.com",
  databaseURL: "https://chatapp-18dd4-default-rtdb.firebaseio.com",
  projectId: "chatapp-18dd4",
  storageBucket: "chatapp-18dd4.firebasestorage.app",
  messagingSenderId: "493234011134",
  appId: "1:493234011134:web:d413a8a5fd9c995b94deaf",
  measurementId: "G-KPBY3LKDD8"
};


const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const messagesCollection = collection(db, "messages");