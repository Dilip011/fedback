import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import creator from "../images/creator.jpg";
import "../styles/editprofile.css";
import { useUserContext } from "./Usercontext";
import { db, storage } from "./firebaseconfig";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [checktagline, setChecktagline] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [name, setName] = useState(user[0]);
  const [email, setEmail] = useState(user[1]);
  const [dob, setDob] = useState(user[3]);
  const [location, setLocation] = useState(user[4]);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(creator);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingDob, setIsEditingDob] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [imageName,setImageName] = useState("");
  let loggedName = user[0];
  let loggedEmail = user[1];
  let loggedDob = user[3];
  let loggedLocation = user[4];

  useEffect(() => {
    const checkTag = async () => {
      try {
        const documentId = user[5];
        const docRef = doc(db, "users", documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if ("bankname" in data && "bank_number" in data && "bank_code" in data) {
            setChecktagline(true);
          }
        }
        const fetchImage = ref(storage,`profile/${user[5]}`)
        const fetchurl = await getDownloadURL(fetchImage);
        setProfileImageUrl(fetchurl);
      } catch (error) {
        console.error("Error checking document:", error);
      }
    };
    checkTag();
  }, [user]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      setImageName(file.name);
      const reader = new FileReader();
      reader.onload = () => setProfileImageUrl(reader.result);
      reader.readAsDataURL(file)
    }
  };

  const handleSave = async () => {
    let updateName = loggedName !== name ? name : null;
    let updateEmail = loggedEmail !== email ? email : null;
    let updateDob = loggedDob !== dob ? dob : null;
    let updateLocation = loggedLocation !== location ? location : null;

    try {
      const docRef = doc(db, "users", user[5]);

      let profileImageUrl = null;
      if (profileImage) {
        const storageRef = ref(storage, `profile/${user[5]}`);
        await uploadBytes(storageRef, profileImage);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(docRef, {
        ...(updateName && { name: updateName }),
        ...(updateEmail && { email: updateEmail }),
        ...(updateDob && { dob: updateDob }),
        ...(updateLocation && { country: updateLocation }),
        ...(profileImageUrl && { profileImage: profileImageUrl }),
      });

      setProfileImageUrl(profileImageUrl || creator);
      navigate('/profile');
    } catch (error) {
      console.error("Error updating Firestore document:", error);
    }

    setIsEditingName(false);
    setIsEditingEmail(false);
    setIsEditingDob(false);
    setIsEditingLocation(false);
    setActiveCard(null);
  };

  return (
    <div className="editprofile-wrapper">
      <div className="editprofile-card">
        <i className="fa-solid fa-times edit-profiletimes"style={{ color: "black", fontSize: "24px", cursor: "pointer" }}onClick={() => navigate("/profile")}></i>
        <div className="editprofile-header">
          <label className="editprofile-image-label">
            <img src={profileImageUrl} alt="User" className="editprofile-image" />
          </label>
          <input type="file" id="profileImageInput" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          <i className="fa-solid fa-file-upload file-icon"style={{ cursor: "pointer",position:"relative",right:"4.5%",fontSize:"24px"}}
            onClick={() => document.getElementById("profileImageInput").click()}></i>
          <h1 className="editprofile-name">{user[0]}</h1>
        </div>
        <div className={`profile-editcard ${activeCard === 0 ? "active" : ""}`} onClick={() => setActiveCard(0)}>
          <div className="profile-editcard-content">
            <div>
              <i className="fa-regular fa-user"></i>
              <p className="edit-item-card">Name</p>
            </div>
            {isEditingName ? (
              <input type="text"value={name}onChange={(e) => setName(e.target.value)}onBlur={() => setIsEditingName(false)}autoFocus className="edit-item-input"/>
            ) : (
              <p
                className="edit-item-card-value"
                onClick={() => setIsEditingName(true)}
                style={{ cursor: "pointer" }}
              >
                {name}
              </p>
            )}
          </div>
          {activeCard !== 0 && <hr />}
        </div>
        <div className={`profile-editcard ${activeCard === 1 ? "active" : ""}`} onClick={() => setActiveCard(1)}>
          <div className="profile-editcard-content">
            <div>
              <i className="fa-regular fa-envelope"></i>
              <p className="edit-item-card">Email</p>
            </div>
            {isEditingEmail ? (
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setIsEditingEmail(false)}
                autoFocus
                className="edit-item-input"
              />
            ) : (
              <p
                className="edit-item-card-value"
                onClick={() => setIsEditingEmail(true)}
                style={{ cursor: "pointer" }}
              >
                {email}
              </p>
            )}
          </div>
          {activeCard !== 1 && <hr />}
        </div>
        <div className={`profile-editcard ${activeCard === 2 ? "active" : ""}`} onClick={() => setActiveCard(2)}>
          <div className="profile-editcard-content">
            <div>
              <i className="fa-regular fa-calendar"></i>
              <p className="edit-item-card">Date of Birth</p>
            </div>
            {isEditingDob ? (
              <input
                type="text"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                onBlur={() => setIsEditingDob(false)}
                autoFocus
                className="edit-item-input"
              />
            ) : (
              <p
                className="edit-item-card-value"
                onClick={() => setIsEditingDob(true)}
                style={{ cursor: "pointer" }}
              >
                {dob}
              </p>
            )}
          </div>
          {activeCard !== 2 && <hr />}
        </div>
        <div className={`profile-editcard ${activeCard === 3 ? "active" : ""}`} onClick={() => setActiveCard(3)}>
          <div className="profile-editcard-content">
            <div>
              <i className="fa-solid fa-location-dot"></i>
              <p className="edit-item-card">Location</p>
            </div>
            {isEditingLocation ? (
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={() => setIsEditingLocation(false)}
                autoFocus
                className="edit-item-input"
              />
            ) : (
              <p
                className="edit-item-card-value"
                onClick={() => setIsEditingLocation(true)}
                style={{ cursor: "pointer" }}
              >
                {location}
              </p>
            )}
          </div>
          {activeCard !== 3 && <hr />}
        </div>
        <button className="summit-edit-item-details" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default EditProfile;

