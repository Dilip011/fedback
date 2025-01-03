import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import creator from "../images/creator.jpg";
import "../styles/editprofile.css";
import { useUserContext } from "./Usercontext";
import { db } from "./firebaseconfig";
import { getDoc, doc } from "firebase/firestore";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [checktagline, setChecktagline] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [name, setName] = useState(user[0]);
  const [email, setEmail] = useState(user[1]);
  const [dob, setDob] = useState(user[3]);
  const [location, setLocation] = useState(user[4]);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const checkTag = async () => {
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
            setChecktagline(true);
          } else {
            return false;
          }
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error checking document:", error);
        return false;
      }
    };
    checkTag();
  }, [user]);

  const handleCardClick = (index) => {
    setActiveCard(index);
  };

  const handleNameEdit = (e) => {
    if (e.type === "keydown" && e.key === "Enter") {
      saveName();
    } else if (e.type === "click") {
      saveName();
    }
  };

  const saveName = () => {
    console.log("The edited name is:", name);
    console.log("The edited Email is:", email);
    console.log("The edited Dob is:", dob);
    console.log("The edited Location is:", location);
    setIsEditingName(false);
    setActiveCard(null);
  };

  return (
    <div className="editprofile-wrapper">
      <div className="editprofile-card">
        <i className="fa-solid fa-times edit-profiletimes" style={{ color: 'black', fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate("/profile")}></i>
        <div className="editprofile-header">
          <img src={creator} alt="User" className="editprofile-image" />
          <h1 className="editprofile-name">{user[0]}</h1>
        </div>

        <div className={`profile-editcard ${activeCard === 0 ? "active" : ""}`} onClick={() => handleCardClick(0)}>
          <div className="profile-editcard-content">
            <div>
              <i className="fa-regular fa-user"></i>
              <p className="edit-item-card">Name</p>
            </div>

            {isEditingName ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleNameEdit}
                onBlur={() => setIsEditingName(false)}
                autoFocus
                className="edit-item-input"
              />
            ) : (
              <p className="edit-item-card-value" onClick={() => setIsEditingName(true)} style={{ cursor: "pointer" }}>
                {name}</p>)}

            {/* <p className="edit-item-card-value">{user[0]}</p> */}
          </div>
          {activeCard !== 0 && <hr />}
        </div>

        <div className={`profile-editcard ${activeCard === 1 ? "active" : ""}`} onClick={() => handleCardClick(1)}>
          <div className="profile-editcard-content">
            <div>
              <i className="fa-regular fa-envelope"></i>
              <p className="edit-item-card">Email</p>
            </div>

            {isEditingName ? (
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleNameEdit}
                onBlur={() => setIsEditingName(false)}
                autoFocus
                className="edit-item-input"
              />
            ) : (
              <p className="edit-item-card-value" onClick={() => setIsEditingName(true)} style={{ cursor: "pointer" }}>
                {email}</p>)}
            {/* <p className="edit-item-card-value">{user[1]}</p> */}
          </div>
          {activeCard !== 1 && <hr />}
        </div>

        <div className={`profile-editcard ${activeCard === 2 ? "active" : ""}`} onClick={() => handleCardClick(2)}>
          <div className="profile-editcard-content">
            <div>
              <i className="fa-regular fa-calendar"></i>
              <p className="edit-item-card">Date of Birth</p>
            </div>
            {isEditingName ? (
              <input
                type="text"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                onKeyDown={handleNameEdit}
                onBlur={() => setIsEditingName(false)}
                autoFocus
                className="edit-item-input"
              />
            ) : (
              <p className="edit-item-card-value" onClick={() => setIsEditingName(true)} style={{ cursor: "pointer" }}>
                {dob}</p>)}
            {/* <p className="edit-item-card-value">{user[3]}</p> */}
          </div>
          {activeCard !== 2 && <hr />}
        </div>

        <div className={`profile-editcard ${activeCard === 3 ? "active" : ""}`} onClick={() => handleCardClick(3)}>
          <div className="profile-editcard-content">
            <div>
              <i className="fa-solid fa-location-dot"></i>
              <p className="edit-item-card">Location</p>
            </div>
            {/* <p className="edit-item-card-value">{user[4]}</p> */}
            {isEditingName ? (
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleNameEdit}
                onBlur={() => setIsEditingName(false)}
                autoFocus
                className="edit-item-input"
              />
            ) : (
              <p className="edit-item-card-value" onClick={() => setIsEditingName(true)} style={{ cursor: "pointer" }}>
                {location}</p>)}
          </div>
          {activeCard !== 3 && <hr />}
        </div>
        <button className="summit-edit-item-details" onClick={saveName}>Save</button>
      </div>

    </div>
  );
};

export default EditProfile;
