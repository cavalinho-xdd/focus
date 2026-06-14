import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCV57Wc-9sZBAvcX_6RxmMPrqDRf1HMtLg",
  authDomain: "focus-15019.firebaseapp.com",
  projectId: "focus-15019",
  storageBucket: "focus-15019.firebasestorage.app",
  messagingSenderId: "141757061603",
  appId: "1:141757061603:web:aea2c354fe6b5e945828d6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
