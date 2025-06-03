// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA06okTChfhWn_H3jX6r5yIMKuEpivrvSY",
  authDomain: "horadosonoisa.firebaseapp.com",
  projectId: "horadosonoisa",
  storageBucket: "horadosonoisa.firebasestorage.app",
  messagingSenderId: "229466004942",
  appId: "1:229466004942:web:5d118dfc0187f33f559f9f"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);

// Inicialização dos serviços
const db = getFirestore(app);
const auth = getAuth(app);

// Exportação dos módulos usados
export {
  db,
  auth,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
