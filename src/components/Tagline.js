import React, { useState } from 'react';
import '../styles/tagline.css';
import contentCreatorImage from '../images/content_creator.jpg';
import { useUserContext } from './Usercontext';
import { doc,updateDoc } from 'firebase/firestore';
import { db } from './firebaseconfig';

const Tagline = () => {
  const [data, setData] = useState({ bank_name: '', number: '', code: '' });
  const {user} = useUserContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async(event) => {
    event.preventDefault();
    
    const newDocId = user[5]; 
    const userDocRef = doc(db, "users", newDocId); 

    await updateDoc(userDocRef, {
      bankname: data.bank_name,
      bank_number: data.number,
      bank_code: data.code,
    });

    setData({ bank_name: '', number: '', code: '' })

  };


  return (
    <div className='tagline-main-wrapper-container'>
      <div className="tagline-main-container">
        <img className='tagline-main-container-img' src={contentCreatorImage} alt="" />

        <div className="tgz-tagline-apply-form">
          <input type="text" name="bank_name" placeholder="Enter your Bank Name" autoComplete="off" value={data.bank_name}
            onChange={handleChange}/>

          <input type="text" name="number" placeholder="Enter your Bank Account Number" autoComplete="off"
            value={data.number} onChange={handleChange}/>

          <input type="text" name="code" placeholder="IFSC Code" autoComplete="off" value={data.code}
            onChange={handleChange}/>

          <button className='tgz-tagline-button' onClick={handleSubmit}>Tagline creator</button>
        </div>
      </div>
    </div>
  );
};

export default Tagline;
