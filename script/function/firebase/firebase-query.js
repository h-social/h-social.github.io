import { getFirestore, collection, getDocs, query, orderBy, addDoc, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


export class FirebaseQuery {
    constructor(firebase) {
        this.app = firebase.getApp()
        this.db = getFirestore(this.app);
    }
    setDoc = async(collectionName, name, value) =>{
        try {
            const docRef = await addDoc(collection(this.db, collectionName), {
                name: name,
                value: value,
                createdAt: serverTimestamp()  // lưu timestamp chuẩn của Firestore
            });
            console.log("Document written with ID: ", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Error writing document:", error);
            throw error;
        }
    } 
    getDoc = async(collectionName, name) =>{
        try {
            // Tạo truy vấn với điều kiện name
            const q = query(
                collection(this.db, collectionName), 
                where("name", "==", name),
                orderBy("createdAt", "desc")
            );
    
            // Lấy dữ liệu
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                console.log(`No documents found with name: ${name} in collection: ${collectionName}`);
                return null;
            }
    
            // Lấy document đầu tiên (mới nhất)
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            
            console.log(`Document found - ID: ${doc.id}, Name: ${data.name}, Value:`, data.value);
            
            // Trả về value của document
            return data.value;
            
        } catch (error) {
            console.error("Error getting document:", error);
            throw error;
        }
    } 
    getAllDocs = async(collectionName) =>{
        try {
            // Tạo truy vấn
            const q = query(collection(this.db, collectionName), orderBy("createdAt", "desc"));
    
            // Lấy dữ liệu
            const querySnapshot = await getDocs(q);
            const documents = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                documents.push({
                    id: doc.id,
                    name: data.name,
                    value: data.value,
                    createdAt: data.createdAt
                });
            });
            
            console.log(`Found ${documents.length} documents in collection: ${collectionName}`);
            return documents;
            
        } catch (error) {
            console.error("Error getting documents:", error);
            throw error;
        }
    }
}
