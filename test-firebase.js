import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCV57Wc-9sZBAvcX_6RxmMPrqDRf1HMtLg",
  authDomain: "focus-15019.firebaseapp.com",
  projectId: "focus-15019",
  storageBucket: "focus-15019.firebasestorage.app",
  messagingSenderId: "141757061603",
  appId: "1:141757061603:web:aea2c354fe6b5e945828d6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Signing in...");
    // We will create a new anonymous user or use an existing test account if we can't
    // Wait, let's just create a random user
    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    const email = "test" + Date.now() + "@example.com";
    const cred = await createUserWithEmailAndPassword(auth, email, "password123");
    console.log("Created user:", cred.user.uid);

    // Create document for user
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "users", cred.user.uid), { displayName: "test user" });
    
    // Now try to update another user's document
    // We need another user id. Let's create another one.
    const email2 = "test2" + Date.now() + "@example.com";
    const cred2 = await createUserWithEmailAndPassword(auth, email2, "password123");
    await setDoc(doc(db, "users", cred2.user.uid), { displayName: "test user 2" });

    // Now as cred2, try to update cred1
    console.log("Trying to update cred1 from cred2...");
    const friendRef = doc(db, "users", cred.user.uid);
    await updateDoc(friendRef, {
      friendRequests: arrayUnion(cred2.user.uid)
    });
    console.log("SUCCESS!");
  } catch(e) {
    console.error("ERROR:", e.code, e.message);
  }
  process.exit(0);
}
test();
