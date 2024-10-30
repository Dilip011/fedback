import React, { useEffect, useState } from 'react';
import Plyr from 'plyr';
import { db, storage } from './firebaseconfig';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { getDownloadURL, ref, listAll } from 'firebase/storage';
import Mainfilm from "../images/film.mp4";
import pic from "../images/Profile-2.jpeg";
import "../styles/homepage.css";

const Homepage = () => {
  const [mediaNameArray, setMediaNameArray] = useState([]);
  const [folderNameArray, setFolderNameArray] = useState([]);
  const [individualContentArray, setIndividualContentArray] = useState([]);
  const [subfolderContentArray, setSubfolderContentArray] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState(null);

  useEffect(() => {
    const fetchTopDocuments = async () => {
      try {
        const collectionRef = collection(db, 'most_popular');
        const q = query(collectionRef, orderBy('count', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);

        const mediaNames = [];
        const folderNames = [];

        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.media_name) {
            mediaNames.push(data.media_name);
          }
          if (data.folder_name) {
            folderNames.push(data.folder_name);
          }
        });

        setMediaNameArray(mediaNames);
        setFolderNameArray(folderNames);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };

    fetchTopDocuments();
  }, []);

  const fetchIndividualContent = async () => {
    const matchedContent = [];
    if (mediaNameArray.length > 0) {
      for (const mediaName of mediaNameArray) {
        const fileRef = ref(storage, `images/${mediaName}`);
        try {
          const downloadUrl = await getDownloadURL(fileRef);
          matchedContent.push({ name: mediaName, downloadUrl });
        } catch (error) {
          console.log(`Error fetching file for ${mediaName}:`, error);
        }
      }
    }
    return matchedContent;
  };

  const fetchSubfolderContent = async () => {
    const parentArray = [];

    for (const folderName of folderNameArray) {
      const subfolderRef = ref(storage, `images/${folderName}`);
      const subfolderContent = [];

      try {
        const result = await listAll(subfolderRef);

        for (const item of result.items) {
          try {
            const downloadUrl = await getDownloadURL(item);
            subfolderContent.push({ name: item.name, downloadUrl });
          } catch (error) {
            console.log(`Error fetching file in ${folderName}:`, error);
          }
        }

        parentArray.push(subfolderContent);
      } catch (error) {
        console.log(`Error accessing subfolder ${folderName}:`, error);
      }
    }

    setSubfolderContentArray(parentArray);
  };

  useEffect(() => {
    const updateContent = async () => {
      const content = await fetchIndividualContent();
      setIndividualContentArray(content);
    };

    updateContent();
  }, [mediaNameArray]);

  useEffect(() => {
    fetchSubfolderContent();
  }, [folderNameArray]);

  useEffect(() => {
    const players = Array.from(document.querySelectorAll('.plyr'));
    players.forEach(player => new Plyr(player));
  }, []);
  

  return (
    <div className='main-homepage-wrapper'>
      <div className="homepage-container">
        <div className="app xyzzz">
          <div className="xyz-profile-box">
            <div className="xyz-profile-image-container">
              <img
                src={pic}
                alt="Profile"
                className="xyz-profile-image-homepage"
              />
              <p className="xyz-user-name">User Name 1</p>
            </div>

            {individualContentArray.map((media) => (
              <div key={media.name} className="searchxyzksdab-media-container">
                {media.name.endsWith('.mp4') ? (
                  <video
                    id={`media-${media.name}`}
                    className="searchxyzksdab-media"
                    controls={false}
                    onDragStart={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    onDragLeave={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedMediaId(media.name);
                    }}
                  >
                    <source src={media.downloadUrl} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    id={`media-${media.name}`}
                    className="searchxyzksdab-media"
                    src={media.downloadUrl}
                    alt="Error Displaying image"
                    onClick={() => {
                      setSelectedMediaId(media.name);
                    }}
                    onDragStart={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    onDragLeave={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                  />
                )}

                {media.name.endsWith('.mp4') && (
                  <div className="searchxyzcustom-controls">
                    <i
                      className="fa-solid fa-play"
                      style={{ color: '#ffffff' }}
                      onClick={() => {
                        setSelectedMediaId(media.name);
                      }}
                    ></i>
                  </div>
                )}
              </div>
            ))}

            {/* <div className="xyz-video-container">
              <video className="xyz-video plyr" controls>
                <source src={Mainfilm} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div> */}
            <p className="xyz-statement">Lorem ipsum dolor sit amet consectetur adipisicing elit...</p>

            <div className="xyz-button-container">
              <button className="xyz-add-to-cart-button">
                <i className="fas fa-shopping-cart"></i> Add to Cart
              </button>
              <button className="xyz-purchase-button">
                <i className="fas fa-check-circle"></i> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
