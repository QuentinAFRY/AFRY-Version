import * as Firestore from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { IProject } from "../classes/Project";


const firebaseConfig = {
  apiKey: "AIzaSyDxG2d_WV5ZMjlwst7MIBSYL0-2Cp3sIRY",
  authDomain: "viewer-project-6fa7f.firebaseapp.com",
  projectId: "viewer-project-6fa7f",
  storageBucket: "viewer-project-6fa7f.appspot.com",
  messagingSenderId: "370766300868",
  appId: "1:370766300868:web:a2276ec53e7064d75e2b91"
};

const app = initializeApp(firebaseConfig);

export const firebaseDB = Firestore.getFirestore(app);

export function getCollection<T>(path: string) {
  return Firestore.collection(firebaseDB, path) as Firestore.CollectionReference<T>;
}

export async function deleteDocument(path: string, id: string) {
  const doc = Firestore.doc(firebaseDB, `${path}/${id}`)
  await Firestore.deleteDoc(doc);
}

export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: T) {
  const doc = Firestore.doc(firebaseDB, `${path}/${id}`)
  await Firestore.updateDoc(doc, data);
}
