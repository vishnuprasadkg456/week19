
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider } from "firebase/auth"; 
import {getStorage} from 'firebase/storage'
import { collection, getDocs, getFirestore } from "firebase/firestore"; 


const firebaseConfig = {
  apiKey: "AIzaSyACUiN-thj4oaRELFQIoHBBf98OaSQy8tU",
  authDomain: "olx-clone-24714.firebaseapp.com",
  projectId: "olx-clone-24714",
  storageBucket: "olx-clone-24714.firebasestorage.app",
  messagingSenderId: "624188386751",
  appId: "1:624188386751:web:e8f6bc37417cc1481a050a"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);
const fireStore = getFirestore(app);


const fetchFromFirestore = async () => {
    try {
      const productsCollection = collection(fireStore, 'products');
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) 
      console.log("Fetched products from Firestore:", productList);
      return productList;
    } catch (error) {
      console.error("Error fetching products from Firestore:", error);
      return [];
    }
  };
  

  export {
    auth,
    provider,
    storage,
    fireStore,
    fetchFromFirestore
  }
