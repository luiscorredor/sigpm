import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, sendPasswordResetEmail,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, collection, getDocs, setDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDIKGYv1eq-fc6f3SHv9F3dq1JL4CYI_GI",
  authDomain: "sigpm-53b9e.firebaseapp.com",
  projectId: "sigpm-53b9e",
  storageBucket: "sigpm-53b9e.firebasestorage.app",
  messagingSenderId: "202230831900",
  appId: "1:202230831900:web:579b198b5dc8df0f99f8d9",
  measurementId: "G-KMKX2WWT3R"
};

const app = getApps().find((item) => item.name === "SIGPM_WEB")
  || initializeApp(firebaseConfig, "SIGPM_WEB");
const auth = getAuth(app);
const firestore = getFirestore(app);

export function readConfig() { return { ...firebaseConfig }; }

async function getUserProfile(user) {
  const fallback = {
    uid: user.uid, email: user.email || "",
    name: (user.email || "Usuario").split("@")[0],
    role: "Usuario", active: true
  };
  try {
    const snapshot = await getDoc(doc(firestore, "users", user.uid));
    if (snapshot.exists()) return { ...fallback, ...snapshot.data(), uid: user.uid, email: user.email || "" };
  } catch (error) {
    console.warn("No se pudo leer el perfil de Firestore; se usará el perfil básico.", error);
  }
  return fallback;
}

export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await getUserProfile(credential.user);
  if (profile.active === false) {
    await signOut(auth);
    throw new Error("Esta cuenta está desactivada. Contacta al administrador.");
  }
  return profile;
}
export function resetPassword(email) { return sendPasswordResetEmail(auth, email.trim()); }
export function logOut() { return signOut(auth); }

export async function currentSession() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) { resolve(null); return; }
      try { resolve(await getUserProfile(user)); } catch (error) { reject(error); }
    }, reject);
  });
}

export async function loadMachinesFromCloud() {
  const snapshot = await getDocs(collection(firestore, "maquinas"));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
}

export async function saveMachineToCloud(machine, uid) {
  if (!machine?.id) throw new Error("La máquina necesita un ID.");
  await setDoc(doc(firestore, "maquinas", machine.id), {
    ...machine, updatedBy: uid || auth.currentUser?.uid || null,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteMachineFromCloud(id) {
  await deleteDoc(doc(firestore, "maquinas", id));
}
