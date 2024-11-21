import React, { useEffect, useState } from 'react';
import "../styles/purchases.css";
import { useUserContext } from './Usercontext';
import { collection, getDocs } from 'firebase/firestore';
import { db, storage } from './firebaseconfig';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { useRef } from 'react';
import image from "../images/Profile-2.jpeg"
import { doc, getDoc } from 'firebase/firestore';

const Purchases = () => {
  const { user } = useUserContext();
  const [usersingle, setUsersingle] = useState([]);
  const [usermultiple, setUsermultiple] = useState([]);
  const [fetchedSingleMedia, setFetchedSingleMedia] = useState([]);
  const [fetchedMultipleMedia, setFetchedMultipleMedia] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [comments, setComments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef(null);
  const [isPauseIconVisible, setPauseIconVisible] = useState(true);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [userfunc, setuserfunc] = useState([]);

  const fetchPurchasedItems = async () => {
    try {
      const purchasedCollection = collection(db, 'purchased');
      const purchasedSnapshot = await getDocs(purchasedCollection);

      const singleMediaArray = [];
      const multipleMediaArray = [];

      purchasedSnapshot.forEach((doc) => {
        if (doc.data().user_id === user[5]) {
          if (doc.data().media_name) {
            singleMediaArray.push(doc.data().media_name);
          } else {
            multipleMediaArray.push(doc.data().folder_name);
          }
        }
      });

      setUsersingle(singleMediaArray);
      setUsermultiple(multipleMediaArray);
    } catch (error) {
      console.error('Error fetching purchased items:', error);
    }
  };

  const fetchIndividualImages = async () => {
    try {
      const rootFolder = 'images';
      const storageRootRef = ref(storage, rootFolder);
      const folderItems = await listAll(storageRootRef);

      const mediaPromises = usersingle.map(async (mediaName) => {
        const mediaRef = folderItems.items.find(item => item.name === mediaName);
        if (mediaRef) {
          const downloadUrl = await getDownloadURL(mediaRef);
          return { name: mediaName, downloadUrl };
        }
        return null;
      });

      const mediaResults = await Promise.all(mediaPromises);
      const filteredMediaResults = mediaResults.filter(media => media !== null);
      setFetchedSingleMedia(filteredMediaResults);
    } catch (error) {
      console.error('Error fetching individual images:', error);
    }
  };

  const fetchSubFolder = async () => {
    try {
      const rootFolder = 'images';
      const storageRootRef = ref(storage, rootFolder);
      const folderItems = await listAll(storageRootRef);

      const subFolderPromises = usermultiple.map(async (folderName) => {
        const subFolderRef = folderItems.prefixes.find(folder => folder.name === folderName);
        if (subFolderRef) {
          const subFolderItems = await listAll(subFolderRef);
          if (subFolderItems.items.length > 0) {
            const firstItemRef = subFolderItems.items[0];
            const downloadUrl = await getDownloadURL(firstItemRef);
            return { name: firstItemRef.name, downloadUrl };
          }
        }
        return null;
      });

      const subFolderResults = await Promise.all(subFolderPromises);
      const filteredSubFolderResults = subFolderResults.filter(folder => folder !== null);
      setFetchedMultipleMedia(filteredSubFolderResults);
    } catch (error) {
      console.error('Error fetching subfolder items:', error);
    }
  };

  const handleContent = async () => {
    try {
      const selectedPath = typeof selectedMediaId === 'string' ? selectedMediaId : selectedMediaId._location?.path_;
      if (!selectedPath) {
        throw new Error('Invalid selectedMediaId');
      }
      const [userId, imageId, imageName] = selectedPath.split('|');

      const rootFolder = 'images';

      const storageRootRef = ref(storage, rootFolder);
      const folderItems = await listAll(storageRootRef);

      let matchingSubfolder = null;
      let documentId = null;

      for (const folder of folderItems.prefixes) {
        const subFolderRef = ref(storage, folder.fullPath);
        const subFolderItems = await listAll(subFolderRef);

        if (subFolderItems.items.some(item => item.name === `${userId}|${imageId}|${imageName}`)) {
          matchingSubfolder = folder.fullPath;
          documentId = matchingSubfolder.split('<')[1]?.split('>')[0];
          break;
        }
      }

      if (matchingSubfolder) {
        const subFolderRef = ref(storage, matchingSubfolder);
        const subFolderItems = await listAll(subFolderRef);
        const mediaItems = subFolderItems.items.filter(item =>
          item.name.endsWith('.png') ||
          item.name.endsWith('.jpg') ||
          item.name.endsWith('.jpeg') ||
          item.name.endsWith('.mp4')
        );

        const mediaWithUrls = await Promise.all(mediaItems.map(async (item) => {
          const downloadUrl = await getDownloadURL(item);
          return { name: item.name, downloadUrl };
        }));
        if (documentId) {
          const docRef = doc(db, 'comments', documentId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setComments([data.content_comment]);
          } else {
            setComments([]);
          }
        } else {
          setComments([]);
        }

        setuserfunc(mediaWithUrls);
        return mediaWithUrls;
      } else {
        // console.log("No matching subfolder found.");
        return [];
      }
    } catch (error) {
      console.error('Error handling content: ', error);
      return [];
    }
  }

  const handlecommentforindividualmedia = async () => {
    try {
      const mediaId = selectedMediaId;

      const documentId = mediaId.split('<')[1]?.split('>')[0];
      if (!documentId) {
        throw new Error('Invalid media ID format');
      }



      const docRef = doc(db, 'comments', documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setComments([data.content_comment]);
      } else {
        // console.log('No such document!');
        setComments([]);
      }
    } catch (error) {
      console.error('Error handling comment for individual media:', error);
    }
  };

  const handleTogglePlayPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
  };


  const handleNextImage = () => {
    const currentIndex = userfunc.findIndex((media) => media.name === selectedMediaId);
    const nextIndex = currentIndex < userfunc.length - 1 ? currentIndex + 1 : 0;
    setSelectedMediaId(userfunc[nextIndex].name);
    setSelectedGroupIndex(nextIndex);
  };

  const handlePreviousImage = () => {
    const currentIndex = userfunc.findIndex((media) => media.name === selectedMediaId);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : userfunc.length - 1;
    setSelectedMediaId(userfunc[previousIndex].name);
    setSelectedGroupIndex(previousIndex);
  };

  useEffect(() => {
    if (user) {
      fetchPurchasedItems();
    }
  }, [user]);

  useEffect(() => {
    if (usersingle.length > 0) {
      fetchIndividualImages();
    }
  }, [usersingle]);

  useEffect(() => {
    if (usermultiple.length > 0) {
      fetchSubFolder();
    }
  }, [usermultiple]);

  useEffect(() => {
    if (selectedMediaId) {
      handleContent();
      handlecommentforindividualmedia();
    }
  }, [selectedMediaId]);



  return (
    <div className='purchaseyourvideos_main_wrapper_ksdab'>
      <div className="purchaseyourvideos_main_container_ksdab">
        {fetchedSingleMedia && fetchedSingleMedia.map((media) => (
          <div key={media.name} className="purchaseksdab-media-container">
            {media.name.endsWith('.mp4') ? (
              <video
                id={`media-${media.name}`}
                className="purchaseksdab-media"
                controls={false}
                onClick={() => {
                  setSelectedMediaId(media.name);
                }}
              >
                <source src={media.downloadUrl} type="video/mp4" />
              </video>
            ) : (
              <img
                id={`media-${media.name}`}
                className="purchaseksdab-media"
                src={media.downloadUrl}
                alt="Error Displaying image"
                onClick={() => {
                  setSelectedMediaId(media.name);
                }}
              />
            )}

            {media.name.endsWith('.mp4') && (
              <div className="purchasecustom-controls">
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

        {fetchedMultipleMedia && fetchedMultipleMedia.map((media, index) => (
          <div key={index} className="purchaseksdab-media-container">
            <div>
              {media.type === 'video' ? (
                <video
                  id={`media-${index}`}
                  className="purchaseksdab-media"
                  controls={false}
                  onClick={() => {
                    setSelectedMediaId(media.name);
                  }}
                >
                  <source src={media.downloadUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  id={`media-${index}`}
                  className="purchaseksdab-media"
                  src={media.downloadUrl}
                  alt="Error Displaying image"
                  onClick={() => {
                    setSelectedMediaId(media.name);
                  }}
                />
              )}

              {media.type === 'video' && (
                <div className="purchasecustom-controls">
                  <i
                    className="fa-solid fa-play"
                    style={{ color: '#ffffff' }}
                    onClick={() => {
                      setSelectedMediaId(media.url);
                    }}
                  ></i>
                </div>
              )}
            </div>

          </div>
        ))}

      </div>



      {/* ***************


                     From here the medialinker starts

                                     ************************ */}

      {selectedMediaId && (
        <div className="purchasemedialinker-container scrollable">
          <div className="purchasecustom-media-container">
            <div className="purchasemedia-content">
              {selectedMediaId.endsWith('.mp4') ? (
                <video
                  id={`media-${selectedMediaId}`}
                  className="purchasecustom-media"
                  controls={false}
                  ref={mediaRef}
                >
                  <source src={fetchedSingleMedia.find((media) => media.name === selectedMediaId)?.downloadUrl || userfunc[selectedGroupIndex]?.downloadUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  id={`media-${selectedMediaId}`}
                  className="purchasecustom-media_images"
                  src={fetchedSingleMedia.find((media) => media.name === selectedMediaId)?.downloadUrl || userfunc[selectedGroupIndex]?.downloadUrl}
                  alt={userfunc}
                />
              )}
              {selectedMediaId.endsWith(".mp4") && (
                <div
                  id={`controls-${selectedMediaId}`}
                  className="purchasemedialinker-controls"
                  onClick={handleTogglePlayPause}
                >

                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ color: '#ffffff', visibility: isPauseIconVisible ? 'visible' : 'hidden' }}></i>

                </div>
              )}
              {userfunc && userfunc.length > 0 && (
                <div className="purchasechevrons">
                  <i
                    className="fa-solid fa-chevron-left"
                    style={{
                      color: 'black',
                      visibility: selectedGroupIndex === 0 ? 'hidden' : 'visible',
                      height: '24px',
                      width: '24px'
                    }}
                    onClick={handlePreviousImage}
                  ></i>
                  <i
                    className="fa-solid fa-chevron-right"
                    style={{
                      color: 'black',
                      visibility: selectedGroupIndex === userfunc.length - 1 ? 'hidden' : 'visible',
                      height: '24px',
                      width: '24px'
                    }}
                    onClick={handleNextImage}
                  ></i>
                </div>
              )}
            </div>

            <div className="purchasevertical-line"></div>

            <div className="purchaseblank_area_div">
              <div className="purchaseksdab_fixed">
                <img className='purchaseksdab_image_comment' src={image} alt="" />
                <div className="purchaseksdab_name_comment">{user[0]}</div>
                <div className="purchaseksdab_content_comment">{comments}</div>
              </div>
              <i
                className="fa-solid fa-times"
                style={{ color: 'black', fontSize: '24px', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedMediaId(null);
                  setuserfunc([]);
                  setComments([]);
                }}
              ></i>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


export default Purchases;
