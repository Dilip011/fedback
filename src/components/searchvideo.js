import React, { useState, useEffect } from 'react';
import { useSearchContext } from './SearchContext';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { db, storage } from './firebaseconfig';
import { doc, getDoc, addDoc, collection, getDocs, query, where, updateDoc, increment } from 'firebase/firestore';
import image from "../images/Profile-2.jpeg"
import { useUserContext } from './Usercontext';
import { useUserpayment } from './Usercontext3';
import { useRef } from 'react';
import "../styles/searchvideo.css";
import { useNavigate } from 'react-router-dom';
import cart from "../images/cart.jpg";
import { useUsersearch } from './UserContext2';
import Tick_mark from "../images/Tick_mark.jpg";

const Searchvideo = () => {
  const { contentIdResults, contentFolderIdResults } = useSearchContext();
  const [fetchedSingleMedia, setFetchedSingleMedia] = useState();
  const [fetchedMultipleMedia, setFetchedMultipleMedia] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [comments, setComments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef(null);
  const [isPauseIconVisible, setPauseIconVisible] = useState(true);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [userfunc, setuserfunc] = useState([]);
  const { user } = useUserContext();
  const { setData } = useUserpayment();
  const Navigate = useNavigate();
  const { id } = useUsersearch();
  const [purchaseIdentified, setpurchaseIdentified] = useState([]);
  const [usermultiple, setUsermultiple] = useState([]);
  const [folderArray, setfolderArray] = useState(null);
  const [backdropfilter, setbackdropfilter] = useState(0);


  const fetchIndividualImages = async () => {
    try {
      const rootFolder = 'images';
      const storageRootRef = ref(storage, rootFolder);
      const folderItems = await listAll(storageRootRef);


      const filteredFolderItems = folderItems.items.filter(item => {
        const itemNameParts = item.name.split('|');
        const firstPart = itemNameParts[0];
        return firstPart !== user[5];
      });

      const mediaPromises = contentIdResults.map(async (mediaPath) => {
        const mediaName = mediaPath.replace('images/', '');
        const mediaRef = filteredFolderItems.find(item => item.name === mediaName);
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
    setFetchedMultipleMedia([]); // Clear previous state
    try {
      const rootFolder = 'images';
      const storageRootRef = ref(storage, rootFolder);
      const folderItems = await listAll(storageRootRef);

      const filteredFolderItems = folderItems.prefixes.filter(item => {
        const itemNameParts = item.name.split('|');
        const secondPart = itemNameParts[1].split('<')[0];
        return secondPart !== user[5];
      });

      for (const folderPath of contentFolderIdResults) {
        const folderName = folderPath.replace('images/', '');
        const matchingFolder = filteredFolderItems.find(folder => folder.name === folderName);

        if (matchingFolder) {
          const subFolderRef = ref(storage, matchingFolder.fullPath);
          const subFolderItems = await listAll(subFolderRef);

          const firstImage = subFolderItems.items.find(item =>
            item.name.endsWith('.png') ||
            item.name.endsWith('.jpg') ||
            item.name.endsWith('.jpeg') ||
            item.name.endsWith('.mp4')
          );

          if (firstImage) {
            const downloadUrl = await getDownloadURL(firstImage);
            // setFetchedMultipleMedia(prevMedia => [
            //   ...prevMedia,
            //   { name: firstImage.name, downloadUrl, folder: folderName }
            // ]);
            setFetchedMultipleMedia(prevMedia => {
              const isDuplicate = prevMedia.some(
                media => media.name === firstImage.name && media.folder === folderName
              );
              if (isDuplicate) {
                return prevMedia; // Avoid duplicates
              }
              return [...prevMedia, { name: firstImage.name, downloadUrl, folder: folderName }];
            });

            break; // Stop after finding the first image
          } else {
            console.log('No suitable file found in subfolder:', folderName);
          }
        } else {
          console.log('No matching folder found for:', folderName);
        }
      }
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

  const goToNewPage = async () => {
    const rootFolder = 'images';
    const storageRootRef = ref(storage, rootFolder);
    const folderItems = await listAll(storageRootRef);

    let matchFound = false;

    if (userfunc != null) {
      for (const folder of folderItems.prefixes) {
        const subFolderRef = ref(storage, folder.fullPath);
        const subFolderItems = await listAll(subFolderRef);

        if (subFolderItems.items.some(item => item.name === selectedMediaId)) {
          const folderName = folder.name;
          setData([user[5], folderName]);
          matchFound = true;
          break;
        }
      }
    }
    if (!matchFound) {
      for (const item of folderItems.items) {
        if (item.name === selectedMediaId) {
          setData([user[5], selectedMediaId]);
          matchFound = true;
          break;
        }
      }
    }

    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+[]{}|;:,.<>?';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < 16; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    Navigate(`/payment/${result}`);
  };

  const addToCart = async () => {
    try {
      const cartCollectionRef = collection(db, 'cart');

      const rootFolder = 'images';
      const storageRootRef = ref(storage, rootFolder);
      const folderItems = await listAll(storageRootRef);

      let matchFound = false;

      for (const folder of folderItems.prefixes) {
        const subFolderRef = ref(storage, folder.fullPath);
        const subFolderItems = await listAll(subFolderRef);

        if (subFolderItems.items.some(item => item.name === selectedMediaId)) {
          const folderName = folder.name;
          await addDoc(cartCollectionRef, {
            folder_name: folderName,
            user_id: user[5]
          });
          matchFound = true;
          break;
        }
      }
      if (!matchFound) {
        for (const item of folderItems.items) {
          if (item.name === selectedMediaId) {
            await addDoc(cartCollectionRef, {
              media_name: selectedMediaId,
              user_id: user[5]
            });
            matchFound = true;
            break;
          }
        }
      }

      if (matchFound) {

      } else {
        console.log('No matching item found to add to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart: ', error);
    }
  };

  const most_searched_word = async () => {
    const currentDate = new Date().toISOString().split('T')[0];
    try {
      const cartCollectionRef = collection(db, 'most_popular');
      const rootFolder = 'images';
      const storageRootRef = ref(storage, rootFolder);
      const folderItems = await listAll(storageRootRef);

      let matchFound = false;

      for (const folder of folderItems.prefixes) {
        const subFolderRef = ref(storage, folder.fullPath);
        const subFolderItems = await listAll(subFolderRef);

        if (subFolderItems.items.some(item => item.name === selectedMediaId)) {
          const folderName = folder.name;

          const querySnapshot = await getDocs(query(cartCollectionRef, where("folder_name", "==", folderName)));

          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, {
              count: increment(1),
              date: currentDate
            });
          } else {
            await addDoc(cartCollectionRef, {
              folder_name: folderName,
              count: 1,
              date: currentDate
            });
          }

          matchFound = true;
          break;
        }
      }

      if (!matchFound) {
        for (const item of folderItems.items) {
          if (item.name === selectedMediaId) {
            const querySnapshot = await getDocs(query(cartCollectionRef, where("media_name", "==", selectedMediaId)));

            if (!querySnapshot.empty) {
              const docRef = querySnapshot.docs[0].ref;
              await updateDoc(docRef, {
                count: increment(1),
                date: currentDate
              });
            } else {
              await addDoc(cartCollectionRef, {
                media_name: selectedMediaId,
                count: 1,
                date: currentDate
              });
            }

            matchFound = true;
            break;
          }
        }
      }

      if (!matchFound) {
        console.log('No matching item found to add to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart: ', error);
    }
  };

  const fetchPurchasedItems = async () => {
    const userId = user[5];
    const PurchasedItemArray = [];
    const PurchasedItemsArray = [];
    const collectionRef = collection(db, "purchased");
    const q = query(collectionRef, where("user_id", "==", userId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.media_name) {
        PurchasedItemArray.push(data.media_name);
      }
      if (data.folder_name) {
        PurchasedItemsArray.push(data.folder_name);
      }
    });

    setpurchaseIdentified(PurchasedItemArray);
    setUsermultiple(PurchasedItemsArray);
  }

  const CheckbackdropFilter = () => {
    if (selectedMediaId && folderArray === null) {
      const isMatched = purchaseIdentified.some((item) => selectedMediaId === item);
      if (isMatched) {
        setbackdropfilter(1);
      }
    }else if (selectedMediaId && folderArray !== null) {
      const isMatched = usermultiple.some((item) => folderArray === item);
      if (isMatched) {
        setbackdropfilter(1);
      }
    }
  };

  useEffect(() => {
    if (contentIdResults.length > 0) {
      fetchIndividualImages();
    }

    if (contentFolderIdResults.length > 0) {
      fetchSubFolder();
    }
  }, [contentIdResults, contentFolderIdResults]);


  useEffect(() => {
    if (selectedMediaId) {
      handleContent();
      handlecommentforindividualmedia();
      most_searched_word();
      CheckbackdropFilter();
    }
  }, [selectedMediaId]);


  useEffect(() => {
    fetchPurchasedItems();
  }, [])




  return (
    <div className='searchxyzyourvideos_main_wrapper_ksdab'>
      <div className="searchxyzyourvideos_main_container_ksdab">
        {fetchedSingleMedia && fetchedSingleMedia.map((media) => (
          <div
            key={media.name}
            className={`searchxyzksdab-media-container ${purchaseIdentified.some((item) => media.name === item)
              ? "backdrop-inactive"
              : "backdrop-active"
              }`}>
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

        {fetchedMultipleMedia && fetchedMultipleMedia.map((media, index) => (
          <div
            key={index}
            className={`searchxyzksdab-media-container ${usermultiple.some((item) => media.folder === item)
              ? "backdrop-inactive"
              : "backdrop-active"
              }`}>
            <div>
              {media.type === 'video' ? (
                <video
                  id={`media-${index}`}
                  className="searchxyzksdab-media"
                  controls={false}
                  onDragStart={(e) => e.preventDefault()}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                  onDragLeave={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                  onClick={() => {
                    setSelectedMediaId(media.name);
                    setfolderArray(media.folder);
                  }}
                >
                  <source src={media.downloadUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  id={`media-${index}`}
                  className="searchxyzksdab-media"
                  src={media.downloadUrl}
                  alt="Error Displaying image"
                  onClick={() => {
                    setSelectedMediaId(media.name);
                    setfolderArray(media.folder);
                  }}
                  onDragStart={(e) => e.preventDefault()}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                  onDragLeave={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                />
              )}

              {media.type === 'video' && (
                <div className="searchxyzcustom-controls">
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

      {selectedMediaId && (
        <>
          <div className="searchxyzmedialinker-container scrollable">
            <div className="searchxyzcustom-media-container">
              {/* <div className={`searchxyzmedia-content ${}`}> */}
              <div className={`searchxyzmedia-content ${backdropfilter === 0 ? "inactive" : "active"}`}>
                {selectedMediaId.endsWith('.mp4') ? (
                  <video
                    id={`media-${selectedMediaId}`}
                    className="searchxyzcustom-media"
                    controls={false}
                    ref={mediaRef}
                    onDragStart={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    onDragLeave={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}>
                    <source
                      src={(fetchedSingleMedia && fetchedSingleMedia.find((media) => media.name === selectedMediaId)?.downloadUrl)}
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <img
                    id={`media-${selectedMediaId}`}
                    className="searchcustom-media_images"
                    src={(fetchedSingleMedia && fetchedSingleMedia.find((media) => media.name === selectedMediaId)?.downloadUrl)}
                    alt={userfunc}
                    onDragStart={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    onDragLeave={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                  />
                )}
                {selectedMediaId.endsWith(".mp4") && (
                  <div
                    id={`controls-${selectedMediaId}`}
                    className="searchxyzmedialinker-controls"
                    onClick={handleTogglePlayPause}
                  >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ color: '#ffffff', visibility: isPauseIconVisible ? 'visible' : 'hidden' }}></i>
                  </div>
                )}
              </div>

              <div className="searchxyzvertical-line"></div>

              <div className="searchxyzblank_area_div">
                <div className="searchxyzksdab_fixed">
                  <img className='searchxyzksdab_image_comment' src={image} alt="" />
                  <div className="searchxyzksdab_name_comment">{user[0]}</div>
                  <div className="searchxyzksdab_content_comment">{comments}</div>
                </div>
                <i
                  className="fa-solid fa-times"
                  style={{ color: 'black', fontSize: '24px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedMediaId(null);
                    if (folderArray !== null) { setfolderArray(null); }
                    setbackdropfilter(0);
                    setuserfunc([]);
                    setComments([]);
                  }}
                ></i>

                {purchaseIdentified.some((item) =>
                  fetchedSingleMedia.some((media) => media.name === item)
                ) ? (
                  <div className="xyz-purchase-searchvideo">
                    <img className="xyz-tick-statement-searchvideo" src={Tick_mark} alt="" />
                    <p className="xyz-purchase-statement-searchvideo">You already purchased it</p>
                  </div>
                ) : (
                  <div className="searchxyzbuy_media_ksdab">
                    <button className="searchbuy_media_ksdab_button" onClick={goToNewPage}>Buy Now</button>
                    <img onClick={addToCart} src={cart} alt="" className="searchbuy_media_ksdab_image" />
                  </div>
                )}

              </div>
            </div>
          </div>

          {userfunc && userfunc.length > 0 && (
            <div className="searchxyzchevrons">
              <i
                className="fa-solid fa-chevron-left chevron_searchxyz_left"
                style={{
                  color: 'black',
                  visibility: selectedGroupIndex === 0 ? 'hidden' : 'visible',
                  height: '24px',
                  width: '24px'
                }}
                onClick={handlePreviousImage}
              ></i>
              <i
                className="fa-solid fa-chevron-right chevron_searchxyz_right"
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
        </>
      )}

      {selectedMediaId && (folderArray !== null) && (
        <>
          <div className="searchxyzmedialinker-container scrollable">
            <div className="searchxyzcustom-media-container">
              {/* <div className={`searchxyzmedia-content ${}`}> */}
              <div className={`searchxyzmedia-content ${backdropfilter === 0 ? "inactive" : "active"}`}>
                {selectedMediaId.endsWith('.mp4') ? (
                  <video
                    id={`media-${selectedMediaId}`}
                    className="searchxyzcustom-media"
                    controls={false}
                    ref={mediaRef}
                    onDragStart={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    onDragLeave={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}>
                    <source
                      src={userfunc[selectedGroupIndex]?.downloadUrl}
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <img
                    id={`media-${selectedMediaId}`}
                    className="searchcustom-media_images"
                    src={userfunc[selectedGroupIndex]?.downloadUrl}
                    alt={userfunc}
                    onDragStart={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    onDragLeave={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                  />
                )}
                {selectedMediaId.endsWith(".mp4") && (
                  <div
                    id={`controls-${selectedMediaId}`}
                    className="searchxyzmedialinker-controls"
                    onClick={handleTogglePlayPause}
                  >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ color: '#ffffff', visibility: isPauseIconVisible ? 'visible' : 'hidden' }}></i>
                  </div>
                )}
              </div>

              <div className="searchxyzvertical-line"></div>

              <div className="searchxyzblank_area_div">
                <div className="searchxyzksdab_fixed">
                  <img className='searchxyzksdab_image_comment' src={image} alt="" />
                  <div className="searchxyzksdab_name_comment">{user[0]}</div>
                  <div className="searchxyzksdab_content_comment">{comments}</div>
                </div>
                <i
                  className="fa-solid fa-times"
                  style={{ color: 'black', fontSize: '24px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedMediaId(null);
                    if (folderArray !== null) { setfolderArray(null); }
                    setbackdropfilter(0);
                    setuserfunc([]);
                    setComments([]);
                  }}
                ></i>

                {usermultiple.some((item) =>
                  fetchedMultipleMedia.some((media) => media.folder === item)
                ) ? (
                  <div className="xyz-purchase-searchvideo">
                    <img className="xyz-tick-statement-searchvideo" src={Tick_mark} alt="" />
                    <p className="xyz-purchase-statement-searchvideo">You already purchased it</p>
                  </div>
                ) : (
                  <div className="searchxyzbuy_media_ksdab">
                    <button className="searchbuy_media_ksdab_button" onClick={goToNewPage}>Buy Now</button>
                    <img onClick={addToCart} src={cart} alt="" className="searchbuy_media_ksdab_image" />
                  </div>
                )}

              </div>
            </div>
          </div>

          {userfunc && userfunc.length > 0 && (
            <div className="searchxyzchevrons">
              <i
                className="fa-solid fa-chevron-left chevron_searchxyz_left"
                style={{
                  color: 'black',
                  visibility: selectedGroupIndex === 0 ? 'hidden' : 'visible',
                  height: '24px',
                  width: '24px'
                }}
                onClick={handlePreviousImage}
              ></i>
              <i
                className="fa-solid fa-chevron-right chevron_searchxyz_right"
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
        </>
      )}

    </div>
  );
};

export default Searchvideo;

