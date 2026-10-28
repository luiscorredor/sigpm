import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, setDoc, deleteDoc, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
const firebaseConfig={apiKey:"AIzaSyDIKGYv1eq-fc6f3SHv9F3dq1JL4CYI_GI",authDomain:"sigpm-53b9e.firebaseapp.com",projectId:"sigpm-53b9e",storageBucket:"sigpm-53b9e.firebasestorage.app",messagingSenderId:"202230831900",appId:"1:202230831900:web:579b198b5dc8df0f99f8d9",measurementId:"G-KMKX2WWT3R"};
const app=getApps().find(x=>x.name==="SIGPM_WEB")||initializeApp(firebaseConfig,"SIGPM_WEB");
const auth=getAuth(app),firestore=getFirestore(app);
export const CLOUD_COLLECTIONS=["maquinas","mantenimientos","productos","produccion","materias","tecnicos","repuestos","ventas"];
export function readConfig(){return {...firebaseConfig};}
async function getUserProfile(user){const fallback={uid:user.uid,email:user.email||"",name:(user.email||"Usuario").split("@")[0],role:"employee",active:true};const s=await getDoc(doc(firestore,"users",user.uid));if(!s.exists())return fallback;const d=s.data();return {...fallback,...d,uid:user.uid,email:user.email||d.email||"",role:d.role||"employee",active:d.active!==false};}
export async function signIn(email,password){const c=await signInWithEmailAndPassword(auth,email.trim(),password);const p=await getUserProfile(c.user);if(p.active===false){await signOut(auth);throw new Error("Esta cuenta está desactivada. Contacta al administrador.");}return p;}
export function resetPassword(email){return sendPasswordResetEmail(auth,email.trim());}
export function logOut(){return signOut(auth);}
export async function currentSession(){return new Promise((resolve,reject)=>{const unsub=onAuthStateChanged(auth,async user=>{unsub();if(!user){resolve(null);return;}try{const p=await getUserProfile(user);resolve(p.active===false?null:p);}catch(e){reject(e);}},reject);});}
function recordsPath(name){if(!CLOUD_COLLECTIONS.includes(name))throw new Error("Colección no permitida");return collection(firestore,"sigpm_data",name,"items");}
export async function loadCollectionFromCloud(name){const s=await getDocs(recordsPath(name));return s.docs.map(x=>({...x.data(),id:x.id}));}
export async function saveRecordToCloud(name,record,uid){if(!record?.id)throw new Error("El registro necesita un ID");const {id,...data}=record;await setDoc(doc(firestore,"sigpm_data",name,"items",String(id)),{...data,updatedBy:uid||auth.currentUser?.uid||null,updatedAt:serverTimestamp()},{merge:true});}
export async function deleteRecordFromCloud(name,id){await deleteDoc(doc(firestore,"sigpm_data",name,"items",String(id)));}
export async function syncAllCollections(localData,uid){const result={};for(const name of CLOUD_COLLECTIONS){const local=Array.isArray(localData?.[name])?localData[name]:[];const cloud=await loadCollectionFromCloud(name);const byId=new Map(cloud.map(record=>[String(record.id),record]));for(const record of local){const id=String(record.id);if(!byId.has(id)){await saveRecordToCloud(name,record,uid);byId.set(id,record);}}result[name]=[...byId.values()];}return result;}

export async function listUserProfiles(){const s=await getDocs(collection(firestore,"users"));return s.docs.map(x=>({uid:x.id,...x.data()}));}
export async function deactivateUserProfile(uid){if(!uid)throw new Error("Usuario no válido");if(uid===auth.currentUser?.uid)throw new Error("No puedes desactivar tu propia cuenta");const ref=doc(firestore,"users",uid);const snap=await getDoc(ref);if(!snap.exists())throw new Error("El perfil no existe en Firestore");if(snap.data().role==="admin")throw new Error("Por seguridad, este apartado solo permite retirar el acceso a empleados");await updateDoc(ref,{active:false,disabledAt:new Date().toISOString(),disabledBy:auth.currentUser?.uid||null});}
