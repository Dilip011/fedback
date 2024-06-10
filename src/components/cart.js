import React, { useEffect } from 'react'
import "../styles/cart.css"
import { useUserContext } from './Usercontext';
import {collection,getDocs } from 'firebase/firestore';
import { db } from './firebaseconfig';
import { useState } from 'react';

const Cart = () => {
  const { user } = useUserContext();
  const [fetchedSingleMedia, setFetchedSingleMedia] = useState([]);
  const [fetchedMultipleMedia, setFetchedMultipleMedia] = useState([]);
  const [usersingle, setUsersingle] = useState([]);
  const [usermultiple, setUsermultiple] = useState([]);

  const fetchfromcart = async () => {
    try {
      const purchasedCollection = collection(db, 'cart');
      const purchasedSnapshot = await getDocs(purchasedCollection);

      const singleMediaArray = [];
      const multipleMediaArray = [];

      purchasedSnapshot.forEach((doc) => {
        if (doc.data().user_id === user[5]) {
          if (doc.data().media_name) {
            singleMediaArray.push(doc.data().media_name);
          } else {
            multipleMediaArray.push(doc.data().folder_name);
          }
        }
      });

      setUsersingle(singleMediaArray);
      setUsermultiple(multipleMediaArray);
    } catch (error) {
      console.error('Error fetching purchased items:', error);
    }
  };

  useEffect(() => {
    console.log(user)

  }, [user])

  
  
  

  return (
    <div className='cartyourvideos_main_wrapper_ksdab'>
      <div className="cartyourvideos_main_container_ksdab">
        cart
      </div>
    </div>
  )
}

export default Cart;