import * as Firestore from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { IProject } from "../classes/Project";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDxG2d_WV5ZMjlwst7MIBSYL0-2Cp3sIRY",
  authDomain: "viewer-project-6fa7f.firebaseapp.com",
  projectId: "viewer-project-6fa7f",
  storageBucket: "viewer-project-6fa7f.appspot.com",
  messagingSenderId: "370766300868",
  appId: "1:370766300868:web:a2276ec53e7064d75e2b91"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const email = "quentin.hamm@afry.com"
const pw = "firebase-auth"
signInWithEmailAndPassword(auth, email, pw)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log(userCredential)
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
});

// 'service cloud.firestore {
//   match /databases/{database}/documents {

//     // This rule allows anyone with your Firestore database reference to view, edit,
//     // and delete all data in your Firestore database. It is useful for getting
//     // started, but it is configured to expire after 30 days because it
//     // leaves your app open to attackers. At that time, all client
//     // requests to your Firestore database will be denied.
//     //
//     // Make sure to write security rules for your app before that time, or else
//     // all client requests to your Firestore database will be denied until you Update
//     // your rules
//     match /{document=**} {
//       allow read, write: if request.time < timestamp.date(2024, 10, 2);
//     }
//   }
// }'


export const firebaseDB = Firestore.getFirestore(app);

export function getCollection<T>(path: string) {
  return Firestore.collection(firebaseDB, path) as Firestore.CollectionReference<T>;
}

export function getDocument<T>(path: string, id: string) {
  return Firestore.doc(firebaseDB, `${path}/${id}`) as Firestore.DocumentReference<T>;
}

export async function deleteDocument(path: string, id: string) {
  const doc = Firestore.doc(firebaseDB, `${path}/${id}`)
  await Firestore.deleteDoc(doc);
}

export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: T) {
  const doc = Firestore.doc(firebaseDB, `${path}/${id}`)
  await Firestore.updateDoc(doc, data);
}
