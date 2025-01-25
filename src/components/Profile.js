import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from './Usercontext';
import { db, storage } from './firebaseconfig';
import { ref, getDownloadURL } from 'firebase/storage';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import '../styles/profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [checktagline, setchecktagline] = useState(false);
  const [profileImage, setprofileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [aboutMe, setAboutMe] = useState(user[9]);

  useEffect(() => {
    const check_tag = async () => {
      try {
        const documentId = user[5];
        const docRef = doc(db, "users", documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if ("bankname" in data && "bank_number" in data && "bank_code" in data) {
            setchecktagline(true);
          }
          const fetchImage = ref(storage, `profile/${user[5]}`);
          const fetchurl = await getDownloadURL(fetchImage);
          setprofileImage(fetchurl);
          if (data.aboutMe) {
            setAboutMe(data.aboutMe);
          }
        }
      } catch (error) {
        console.error("Error checking document:", error);
      }
    };
    check_tag();
  }, [user]);

  const handleAboutMeEdit = async (e) => {
    if (e.key === "Enter") {
      try {
        const documentId = user[5];
        const docRef = doc(db, "users", documentId);
        await updateDoc(docRef, { aboutMe });
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating About Me:", error);
      }
    }
  };

  return (
    <div className="user-profile-wrapper">
      <div className="user-profile-card">
        <div className="user-profile-header">
          <img src={profileImage} alt="User" className="user-profile-image" />
          <h1 className="user-profile-name">{user[0]}</h1>
          <button className="user-profile-button" onClick={() => navigate("/editprofile")}>Edit Profile</button>
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
            <span className="user-detail-value">{user[10]}</span>
          </div>
        </div>
        {!checktagline && (
          <div className="user-profile-bars">
            <button className="user-profile-bar" onClick={() => navigate('/tagline')}>
              <i className="fa-solid fa-user-plus"></i>Became a Member
            </button>
          </div>
        )}
        <div className="user-profile-circles-container">
          <div className="user-profile-circle">
            <i className="circle-icon fas fa-user"></i>
            <div className="user-circle-value">{user[7]}</div>
            <div className="user-circle-label">Total Posts</div>
          </div>
          <div className="user-profile-circle">
            <i className="circle-icon fas fa-chart-line"></i>
            <div className="user-circle-value">{user[8]}</div>
            <div className="user-circle-label">Total Posts Sold</div>
          </div>
        </div>
        <div className="user-profile-bio">
          <h2>About Me</h2>
          {!isEditing ? (
            <p onClick={() => setIsEditing(true)} style={{ cursor: "pointer" }}>
              {aboutMe} <i className="fas fa-pencil-alt"></i>
            </p>
          ) : (
            <input
              type="text"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              onKeyDown={handleAboutMeEdit}
              className="about-me-input"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
