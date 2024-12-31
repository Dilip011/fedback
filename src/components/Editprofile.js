import React, { useState, useEffect } from 'react';
import "../styles/editprofile.css";
import { useUserContext } from './Usercontext';
import { db } from './firebaseconfig';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import creator from '../images/creator.jpg';

const EditProfile = () => {
  const { user } = useUserContext();
  const [checkTagline, setCheckTagline] = useState(false);
  const [profileName, setProfileName] = useState(user[0]); // Initially set to user[0]
  const [editableData, setEditableData] = useState({
    name: user[0],
    email: user[1],
    dob: user[3],
    location: user[4],
  });

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    dob: false,
    location: false,
  });

  const handleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleSave = async (field) => {
    try {
      const documentId = user[5];
      const docRef = doc(db, "users", documentId);
      await updateDoc(docRef, { [field]: editableData[field] });

      if (field === "name") {
        setProfileName(editableData.name); // Update profile header name only when saved
      }

      setIsEditing((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error("Error saving field:", error);
    }
  };

  const handleChange = (field, value) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
  };

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
            setCheckTagline(true);
          }
        }
      } catch (error) {
        console.error("Error checking document:", error);
      }
    };

    checkTag();
  }, [user]);

  return (
    <div className="editprofile-wrapper">
      <div className="editprofile-card">
        <div className="editprofile-header">
          <img src={creator} alt="User" className="editprofile-image" />
          <h1 className="editprofile-name">{profileName}</h1>
        </div>
        <div className="editprofile-details">
          {["name", "email", "dob", "location"].map((field) => (
            <div className="editprofile-row" key={field}>
              <label className="editprofile-detail-label">
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </label>
              {isEditing[field] ? (
                <div className="editprofile-input-wrapper">
                  <input
                    type="text"
                    value={editableData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="editprofile-input"
                  />
                  <button
                    className="editprofile-save-button"
                    onClick={() => handleSave(field)}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <span
                  className="editprofile-detail-value"
                  onClick={() => handleEdit(field)}
                >
                  {editableData[field]}
                </span>
              )}
            </div>
          ))}
        </div>
        {!checkTagline && (
          <div className="editprofile-bars">
            <button className="editprofile-bar">
              <i className="fa-solid fa-user-plus"></i>Became a Member
            </button>
          </div>
        )}
        <div className="editprofile-bio">
          <h2>About Me</h2>
          <p>
            Passionate about creating innovative solutions. Skilled in modern
            web development and always eager to learn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
