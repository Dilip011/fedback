import React from 'react';
import "../styles/payment.css";
import { useUserpayment } from './Usercontext3';
import { useNavigate } from 'react-router-dom';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage, db } from './firebaseconfig';
import { addDoc, collection } from 'firebase/firestore';

const Payment = () => {
    const { data } = useUserpayment();
    const navigate = useNavigate();

    const paymentdetector = async () => {
        if (!data) return;

        const itemName = data[1];
        const userId = data[0];
        const storageRootRef = ref(storage, 'images'); 

        try {
            const folderItems = await listAll(storageRootRef);
            const matchingFolder = folderItems.prefixes.find(folder => folder.name === itemName);

            if (matchingFolder) {
                const collectionRef = collection(db, 'purchased');
                await addDoc(collectionRef, {
                    folder_name: itemName,
                    user_id: userId
                });
            } else {
                const matchingFile = folderItems.items.find(file => file.name === itemName);

                if (matchingFile) {
                    await getDownloadURL(ref(storage, `images/${itemName}`));
                    
                    const collectionRef = collection(db, 'purchased');
                    await addDoc(collectionRef, {
                        media_name: itemName,
                        user_id: userId
                    });
                } else {
                    console.error('Matching folder or file not found');
                }
            }
            navigate('/home'); 
        } catch (error) {
            console.error('Error fetching items or writing to Firestore:', error);
        }
    };

    return (
        <div>
            <button onClick={paymentdetector} className='payment_ksdab_media'>Pay Now</button>
            {data ? (
                <h1>{data[0]}</h1>
            ) : (
                <h1>Loading...</h1>
            )}
        </div>
    );
};

export default Payment;
