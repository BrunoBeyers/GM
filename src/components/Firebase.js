import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB9D54puXaXxsis7FyQDCw7HmVPXGTK-L8",
    authDomain: "pixsol-war.firebaseapp.com",
    databaseURL: "https://pixsol-war-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pixsol-war",
    storageBucket: "pixsol-war",
    messagingSenderId: "862426649932",
    appId: "1:862426649932:web:56bb83115e8af4eb36ebe9"
};

// Initialiser Firebase uniquement si aucune application n'est déjà initialisée
if (!getApps().length) {
    initializeApp(firebaseConfig);
}

const db = getFirestore(); // Obtenir l'instance de Firestore

export { db }; // Exporter l'instance de Firestore