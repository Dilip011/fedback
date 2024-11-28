import React, { useEffect, useState } from 'react';
import Plyr from 'plyr';
import { db, storage } from './firebaseconfig';
import { collection, getDocs, orderBy, query, limit, getDoc, doc, addDoc } from 'firebase/firestore';
import { getDownloadURL, ref, listAll } from 'firebase/storage';
import pic from "../images/Profile-2.jpeg";
import "../styles/homepage.css";
import { useUserContext } from './Usercontext';
import { useUsersearch } from './UserContext2';
import { useUserpayment } from './Usercontext3';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const [mediaNameArray, setMediaNameArray] = useState([]);
  const [folderNameArray, setFolderNameArray] = useState([]);
  const [individualContentArray, setIndividualContentArray] = useState([]);
  const [subfolderContentArray, setSubfolderContentArray] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const { user } = useUserContext();
  const { id } = useUsersearch();
  const { setData } = useUserpayment();
  const Navigate = useNavigate();
  const [purchaseIdentified, setpurchaseIdentified] = useState([]);
  const [usermultiple, setUsermultiple] = useState([]);

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

  const goToNewPage = async () => {
    const rootFolder = 'images';
    const storageRootRef = ref(storage, rootFolder);
    const folderItems = await listAll(storageRootRef);

    let matchFound = false;

    if (selectedMediaId != null) {
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
          const userDocRef = doc(db, "users", contentId);
          const userDoc = await getDoc(userDocRef);
          const commentsCollectionRef = collection(db, "comments");
          const querySnapshot = await getDocs(commentsCollectionRef);
          let docCommentId = "";

          querySnapshot.forEach((doc) => {
            const docContentId = doc.data().content_id?.replace(/^images\//, "");
            if (docContentId === mediaName) {
              docCommentId = doc.data().content_comment

            }
          })
          if (userDoc.exists()) {
            const username = userDoc.data().name;
            matchedContent.push({ name: mediaName, contentId: username, docCommentId, downloadUrl });
          } else {
            console.log(`No document found for contentId: ${contentId}`);
          }
        } catch (error) {
          console.log(`Error fetching file or Firestore data for ${mediaName}:`, error);
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

      const userDocRef = doc(db, "users", folderId);
      const userDoc = await getDoc(userDocRef);
      let username = "";
      const commentsCollectionRef = collection(db, "comments");
      const querySnapshot = await getDocs(commentsCollectionRef);
      let docCommentId = "";

      querySnapshot.forEach((doc) => {
        const docContentId = doc.data().contentfolder_id?.replace(/^images\//, "");
        if (docContentId === folderName) {
          docCommentId = doc.data().content_comment
        }
      })
      if (userDoc.exists()) {
        username = userDoc.data().name;
      } else {
        console.log(`No document found for folderId: ${folderId}`);
      }

      try {
        const result = await listAll(subfolderRef);
        for (const item of result.items) {
          try {
            const downloadUrl = await getDownloadURL(item);
            subfolderContent.push({ name: item.name, contentId: username, docCommentId, downloadUrl, folderName });
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

  const fetchPurchasedItems = async () => {
    try {
      const folderMatchedItems = [];
      const matchedItems = [];
      const storageRootRef = ref(storage, "images");

      const folderList = await listAll(storageRootRef);

      for (const folder of folderList.prefixes) {
        const folderName = folder.name;
        const folderRef = ref(storageRootRef, folderName);

        const fileList = await listAll(folderRef);

        for (const file of fileList.items) {
          const fileName = file.name;

          if (Array.isArray(subfolderContentArray) && Array.isArray(subfolderContentArray[0])) {
            const isMatch = subfolderContentArray[0].some(item => item.name.includes(fileName));

            if (isMatch) {
              folderMatchedItems.push(folderName);
              break;
            }
          }
        }
      }

      const purchasedCollectionRef = collection(db, "purchased");
      const purchasedSnapshot = await getDocs(purchasedCollectionRef);

      purchasedSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.media_name && individualContentArray.some(item => item.name === data.media_name)) {
          matchedItems.push(data);
        }
      });
      setpurchaseIdentified(matchedItems);
      setUsermultiple(folderMatchedItems);

    } catch (error) {
      console.error('Error fetching purchased items:', error);
    }
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

  useEffect(() => {
    fetchPurchasedItems();
  }, [individualContentArray, subfolderContentArray]);

  useEffect(() => {
    if (usermultiple.length > 0) {
      console.log("This is usermultiple", usermultiple);

    }

  }, [])




  return (
    <div className='main-homepage-wrapper'>
      <div className="homepage-container">
        <div className="app xyzzz">
          {individualContentArray.map((media, index) => (
            <div className="xyz-profile-box" key={index}>
              <div className="xyz-profile-image-container">
                <img src={pic} alt="Profile" className="xyz-profile-image-homepage" />
                <p className="xyz-user-name">{media.contentId}</p>
              </div>
              <p className='xyz-horizontal-line'></p>
              {media.name.endsWith('.mp4') ? (
                <div className="xyz-video-container">
                  <video id={`media-${media.name}`} className="xyz-video plyr" controls>
                    <source src={media.downloadUrl} type="video/mp4" />
                  </video>
                </div>
              ) : (
                <div className="image-container">
                  <img id={`media-${media.name}`} className="homexyzksdab-media" src={media.downloadUrl} alt="Image" />
                </div>
              )}
              <p className="xyz-statement">{media.docCommentId}</p>


              {purchaseIdentified.some(item => item.media_name === media.name) ? (
                <p className='xyz-purchase-statement'>You already purchased it</p>
              ) : (
                <div className="xyz-button-container">
                  <button className="xyz-add-to-cart-button" onClick={async () => {
                    setSelectedMediaId(media.name);
                    if (selectedMediaId) {
                      await addToCart();
                      setSelectedMediaId(null);
                    }
                  }}>
                    <i className="fas fa-shopping-cart"></i> Add to Cart
                  </button>

                  <button className="xyz-purchase-button" onClick={async () => {
                    setSelectedMediaId(media.name);
                    if (selectedMediaId) {
                      await goToNewPage();
                      setSelectedMediaId(null);
                    }
                  }}>
                    <i className="fas fa-check-circle"></i> Buy Now
                  </button>
                </div>
              )}
            </div>
          ))}


          {subfolderContentArray.map((subfolder, index) => (
            <div className="xyz-profile-box" key={index}>
              <div className="xyz-profile-image-container">
                <img src={pic} alt="Profile" className="xyz-profile-image-homepage" />
                <p className="xyz-user-name">{subfolder[0]?.contentId || "Unknown User"}</p>
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
                      <img id={`media-${media.name}`} className="xyz-subfolder-media" src={media.downloadUrl} alt="Image" />
                    )}
                  </div>
                ))}
              </div>
              <p className="xyz-statement">{subfolder[0]?.docCommentId || "Unknown User"}</p>

              {usermultiple.length>0 === subfolder[0]?.folderName ? (
                <p className="xyz-purchase-statement">You already purchased it</p>
              ) : (
                <div className="xyz-button-container">
                  <button
                    className="xyz-add-to-cart-button"
                    onClick={async () => {
                      setSelectedMediaId(subfolder[0]?.name);
                      if (selectedMediaId) {
                        await addToCart();
                        setSelectedMediaId(null);
                      }
                    }}
                  >
                    <i className="fas fa-shopping-cart"></i> Add to Cart
                  </button>
                  <button
                    className="xyz-purchase-button"
                    onClick={async () => {
                      setSelectedMediaId(subfolder[0]?.name);
                      if (selectedMediaId) {
                        await goToNewPage();
                        setSelectedMediaId(null);
                      }
                    }}
                  >
                    <i className="fas fa-check-circle"></i> Buy Now
                  </button>
                </div>
              )}


            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;