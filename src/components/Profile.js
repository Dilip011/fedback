import React from 'react';
import { useNavigate } from 'react-router-dom';
import creator from '../images/creator.jpg';
import '../styles/profile.css';
import { useUserContext } from './Usercontext';
import { db } from './firebaseconfig';
import { getDoc, doc } from 'firebase/firestore';
import { useEffect } from 'react';
import { useState } from 'react';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [checktagline, setchecktagline] = useState(false);

  useEffect(() => {

    const check_tag = async () => {
      try {
        const documentId = user[5];
        const docRef = doc(db, "users", documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const hasBankName = "bankname" in data;
          const hasBankNumber = "bank_number" in data;
          const hasBankCode = "bank_code" in data;

          if (hasBankName && hasBankNumber && hasBankCode) {
            setchecktagline(true);
          } else {
            console.log("One or more required fields are missing.");
            return false;
          }
        } else {
          console.log("Document does not exist.");
          return false;
        }
      } catch (error) {
        console.error("Error checking document:", error);
        return false;
      }
    };
    check_tag();}, [user])

  return (
    <div className="user-profile-wrapper">
      <div className="user-profile-card">
        <div className="user-profile-header">
          <img src={creator} alt="User" className="user-profile-image" />
          <h1 className="user-profile-name">{user[0]}</h1>
          <button className='user-profile-button' onClick={() => navigate("/editprofile")}>Edit Profile</button>
        </div>
        <div className="user-profile-details">
          <div className="user-profile-row">
            <i className="fa-solid fa-envelope"></i>
            <span className="user-detail-label">Email:</span>
            <span className="user-detail-value">{user[1]}</span>
          </div>
          <div className="user-profile-row">
            <i className="fa-solid fa-phone"></i>
            <span className="user-detail-label">Phone:</span>
            <span className="user-detail-value">{user[2]}</span>
          </div>
          <div className="user-profile-row">
            <i className="fa-solid fa-calendar"></i>
            <span className="user-detail-label">Date of Birth:</span>
            <span className="user-detail-value">{user[3]}</span>
          </div>
          <div className="user-profile-row">
            <i className="fa-solid fa-location-pin"></i>
            <span className="user-detail-label">Location:</span>
            <span className="user-detail-value">{user[4]}</span>
          </div>
          <div className="user-profile-row">
            <i className="fa-solid fa-building-columns"></i>
            <span className="user-detail-label">Bank Name:</span>
            <span className="user-detail-value">{user[8]}</span>
          </div>
        </div>

        {!checktagline &&
          <div className="user-profile-bars">
            <button className="user-profile-bar" onClick={() => navigate('/tagline')}>
              <i className="fa-solid fa-user-plus"></i>Became a Member
            </button>
          </div>}

        <div className="user-profile-circles-container">
          <div className="user-profile-circle">
            <i className="circle-icon fas fa-user"></i>
            <div className="user-circle-value">{user[7]}</div>
            <div className="user-circle-label">Total Posts</div>
          </div>
          <div className="user-profile-circle">
            <i className="circle-icon fas fa-chart-line"></i>
            <div className="user-circle-value">25</div>
            <div className="user-circle-label">Total Posts Sold</div>
          </div>
        </div>
        <div className="user-profile-bio">
          <h2>About Me</h2>
          <p>
            Passionate about creating innovative solutions. Skilled in modern web development and always eager to learn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
