
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import { storage, db } from './firebaseconfig';
import { addDoc, collection,updateDoc,doc,getDoc,setDoc } from 'firebase/firestore';
import "../styles/createvideo.css"
import { useUserContext } from './Usercontext';
import { useNavigate } from 'react-router-dom';


const CreateVideo = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [textareaContent, setTextareaContent] = useState('');
  const [textareatitle, setTextareatitle] = useState('');
  const { user } = useUserContext();
  const navigate = useNavigate();

  
  function handleclickonfile() {
    navigate(`/yourcontent/${user[6]}`);
  }
  

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 4) {
      alert("You can select a maximum of 4 files.");
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleDeselectFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  const calculateGridStyle = () => {
    const count = selectedFiles.length;
    switch (count) {
      case 1:
        return { gridTemplateColumns: '1fr' };
      case 2:
        return { gridTemplateColumns: '1fr 1fr' };
      default:
        return { gridTemplateColumns: 'repeat(2, 1fr)' };
    }
  };

  const handleUploadNow = async () => {
    try {
        let contentId;
        let docRef;

        // Add the new comment to the "comments" collection
        docRef = await addDoc(collection(db, 'comments'), {
            content_title: textareatitle,
            content_comment: textareaContent,
            user_id: user[5],
            timestamp: new Date()
        });

        const documentId = docRef.id;

        // Handle single or multiple file uploads
        if (selectedFiles.length === 1) {
            const file = selectedFiles[0];
            contentId = `images/${user[5] + '|' + v4() + '<' + documentId + '>' + file.name}`;
            const imageRef = ref(storage, contentId);
            await uploadBytes(imageRef, file);

            const uploadedFilePath = await getDownloadURL(imageRef);

            // Update the Firestore document with the correct content_id
            await updateDoc(docRef, { content_id: contentId });
        } else {
            const groupId = v4();
            contentId = `images/${v4() + '|' + user[5] + '<' + documentId + '>'}`;
            for (const file of selectedFiles) {
                const imageRef = ref(storage, `${contentId}/${user[5] + '|' + v4() + '|' + file.name}`);
                await uploadBytes(imageRef, file);

                const uploadedFilePath = await getDownloadURL(imageRef);
            }

            // Update the Firestore document with the correct content_id
            await updateDoc(docRef, { contentfolder_id: contentId });
        }

        // Update the user's Totalposts field in the users collection
        const userDocRef = doc(db, 'users', user[5]);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const currentTotalPosts = userData.Totalposts || 0;
            await updateDoc(userDocRef, { Totalposts: currentTotalPosts + 1 });
        } else {
            await setDoc(userDocRef, { Totalposts: 1 }, { merge: true });
        }

        // Reset UI states
        setSelectedFiles([]);
        setTextareaContent('');
        setTextareatitle('');
    } catch (error) {
        console.error('Error uploading files or updating Totalposts: ', error);
    }
};

     

  return (
    <div className="create-video-overlay">
      <div className="create-video-container">
        <i className="fa-solid fa-circle-xmark" onClick={handleclickonfile}></i>
        <textarea
          value={textareatitle}
          onChange={(e) => setTextareatitle(e.target.value)}
          placeholder="Enter the Title"></textarea>
        <div className="horizontal-line"></div>
        <textarea
          value={textareaContent}
          onChange={(e) => setTextareaContent(e.target.value)}
          placeholder="Enter the comment"></textarea>

        <div className="selected-files-grid" style={calculateGridStyle()}>
          {selectedFiles.map((file, index) => (
            <div className="selected-file-container" key={index}>
              <i
                className="fa-solid fa-xmark deselect-icon"
                onClick={() => handleDeselectFile(index)}
              ></i>
              {file.type.startsWith('image/') && (
                <img src={URL.createObjectURL(file)} alt="Selected" />
              )}
              {file.type.startsWith('video/') && (
                <video controls>
                  <source src={URL.createObjectURL(file)} type={file.type} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ))}
        </div>

        <div className="horizontal-line"></div>
        <div className="controls-container">
          <label htmlFor="fileInput">
            <i className="fa-solid fa-file"></i>
          </label>
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />
          <button onClick={handleUploadNow}>Upload Now</button>
        </div>
      </div>
    </div>
  );
};

export default CreateVideo;
















