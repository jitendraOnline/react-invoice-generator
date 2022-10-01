import { getFirestore } from "firebase/firestore";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  firebaseConfig,
  firebaseConfigVypaar,
  firebaseConfigManoj,
} from "../firebaseConfig";

import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Initialize Firebase
export const app = initializeApp(firebaseConfigVypaar);
const db = getFirestore(app);
export const auth = getAuth(app);

export const docRef = (collectionName: string) => {
  return collection(
    db,
    collectionName
    // //auth.currentUser?.email ==='admin@admin.com'?collectionName: "users/" + auth.currentUser?.uid + "/" + collectionName
    //  "users/" + auth.currentUser?.uid + "/" + collectionName
  );
};


export const  addDoc1 = (data: any, collectionName: string) => {
  console.log("ADDING TO SERVER :-", collectionName);
  return addDoc(collection(db, collectionName), {
    ...data,
    createdDate: new Date(),
    createdBy: auth.currentUser?.email,
    isNotAdmin: !auth.currentUser?.email?.indexOf("admin"),
    modifiedBy: "",
  })
    .then((dataRetured) => {
      console.log("added data", dataRetured.id);
      return dataRetured;
    })
    .catch((e) => {
      alert("Unable to Add. Please login or check your internet connection.");
      console.log("error", e);
    });
};

export const deleteDoc1 = (collectionName: string, id: any) => {
  const docRef = doc(db, collectionName, id);
  return deleteDoc(docRef).then((data) => {
    console.log("deleted data", data);
  });
};

export const getDataById = (collectionName: string, id: any) => {
  const docRef = doc(
    db,
    //"users/" + auth.currentUser?.uid + "/" + collectionName,
    collectionName,
    id
  );
  return getDoc(docRef);
};

export const setDoc1 = (data: any, collectionName: string, id: any) => {
  const docRef = doc(
    db,
    collectionName,
    // "users/" + auth.currentUser?.uid + "/" + collectionName,
    id
  );
  return setDoc(docRef, {
    ...data,
    modifiedBy: auth.currentUser?.email,
    modifiedDate:new Date(),
  })
    .then((dataReturned) => {
      console.log("updated data with id", dataReturned);
      return dataReturned;
    })
    .catch((e) => {
      alert("Unable to update. Please login or check your internet connection");
    });
};