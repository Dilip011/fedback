import React, { useEffect, useState } from 'react';
import Plyr from 'plyr';
import { db, storage } from './firebaseconfig';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { getDownloadURL, ref, listAll } from 'firebase/storage';
import pic from "../images/Profile-2.jpeg";
import "../styles/homepage.css";
import { useUserContext } from './Usercontext';

const Homepage = () => {
  const [mediaNameArray, setMediaNameArray] = useState([]);
  const [folderNameArray, setFolderNameArray] = useState([]);
  const [individualContentArray, setIndividualContentArray] = useState([]);
  const [subfolderContentArray, setSubfolderContentArray] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const { user } = useUserContext();

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
        const contentId = mediaName.split('|')[0];
        if (contentId === user[5]) {
          continue;
        }

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
      const folderId = folderName.split('|')[1].split('<')[0];

      if (folderId === user[5]) {
        continue;
      }

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
          {individualContentArray.map((media, index) => (
            <div className="xyz-profile-box" key={index}>
              <div className="xyz-profile-image-container">
                <img
                  src={pic}
                  alt="Profile"
                  className="xyz-profile-image-homepage"
                />
                <p className="xyz-user-name">User Name 1</p>
              </div>
              <p className='xyz-horizontal-line'></p>
              {media.name.endsWith('.mp4') ? (
                <div className="xyz-video-container">
                  <video
                    id={`media-${media.name}`}
                    className="xyz-video plyr"
                    controls
                  >
                    <source src={media.downloadUrl} type="video/mp4" />
                  </video>
                </div>
              ) : (
                // <img
                //   id={`media-${media.name}`}
                //   className="homexyzksdab-media"
                //   src={media.downloadUrl}
                //   alt="Image"
                //   onClick={() => {
                //     setSelectedMediaId(media.name);
                //   }}
                //   onDragStart={(e) => e.preventDefault()}
                //   onDragOver={(e) => e.preventDefault()}
                //   onDragEnter={(e) => e.preventDefault()}
                //   onDragLeave={(e) => e.preventDefault()}
                //   onDrop={(e) => e.preventDefault()}
                // />
                <div className="image-container">
                  <img
                    id={`media-${media.name}`}
                    className="homexyzksdab-media"
                    src={media.downloadUrl}
                    alt="Image"
                    onClick={() => {
                      setSelectedMediaId(media.name);
                    }}
                  />
                </div>
              )}
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
          ))}

          {subfolderContentArray.map((subfolder, index) => (
            <div className="xyz-profile-box" key={index}>
              <div className="xyz-profile-image-container">
                <img src={pic} alt="Profile" className="xyz-profile-image-homepage" />
                <p className="xyz-user-name">User Name 2</p>
              </div>
              <p className='xyz-horizontal-line'></p>
              <div className="xyz-two-column-media-grid">
                {subfolder.map((media, subIndex) => (
                  <div className="xyz-media-item" key={subIndex}>
                    {media.name.endsWith('.mp4') ? (
                      <video id={`media-${media.name}`} className="xyz-subfolder-video plyr" controls>
                        <source src={media.downloadUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <img
                        id={`media-${media.name}`}
                        className="xyz-subfolder-media"
                        src={media.downloadUrl}
                        alt="Image"
                        onClick={() => {
                          setSelectedMediaId(media.name);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
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
          ))}
        </div>
      </div>
    </div>
  );

};

export default Homepage;
