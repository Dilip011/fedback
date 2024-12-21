import React from 'react';
import userImage from '../images/Profile.jpg';
import { useUserContext } from './Usercontext';
import "../styles/profile.css";

const Profile = () => {
  const {user} = useUserContext();
  

  return (
    <div className="page-container">
      <div className="profile-page-container">

        <div className="profile-row">
          <div className="profile-box user-image-box">
            <img src={userImage} alt="User" className="user-image round-user-image" />
          </div>


          <div className="profile-box name-box">
            <i className="fa-solid fa-user"></i>
            <span className="element-label">Name:</span>
            <span className="element-value">{user[0]}</span>
          </div>
        </div>


        <div className="profile-row">
          <div className="profile-box email-box">
            <i className="fa-solid fa-envelope"></i>
            <span className="element-label">Email:</span>
            <span className="element-value">{user[1]}</span>
          </div>
          <div className="profile-box phone-box">
            <i className="fa-solid fa-phone"></i>
            <span className="element-label">Phone:</span>
            <span className="element-value">{user[2]}</span>
          </div>
        </div>


        <div className="profile-row">
          <div className="profile-box dob-box">
            <i className="fa-solid fa-calendar"></i>
            <span className="element-label">Date of Birth:</span>
            <span className="element-value">{user[3]}</span>
          </div>

          <div className="profile-box dob-box">
            <i className="fa-solid fa-location-pin"></i>
            <span className="element-label">Location:</span>
            <span className="element-value">{user[4]}</span>
          </div>
        </div>


        <div className="user-bio">
          <h2>Bio</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;




