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
import { UserContextProfile, useUserprofile } from './Usercontext4';
import { useNavigate } from 'react-router-dom';
import Tick_mark from "../images/Tick_mark.jpg";
import { useLocation } from "react-router-dom";


const Homepage = () => {
  const [mediaNameArray, setMediaNameArray] = useState([]);
  const [folderNameArray, setFolderNameArray] = useState([]);
  const [individualContentArray, setIndividualContentArray] = useState([]);
  const [subfolderContentArray, setSubfolderContentArray] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const { user } = useUserContext();
  const { id } = useUsersearch();
  const { setData } = useUserpayment();
  const { setProfile } = useUserprofile();
  const Navigate = useNavigate();
  const [purchaseIdentified, setpurchaseIdentified] = useState([]);
  const [usermultiple, setUsermultiple] = useState([]);
  const [userid, setuserid] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const message = location.state?.message;


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
            const field_id = userDoc.data().Document_Id;
            matchedContent.push({ name: mediaName, contentId: username, docCommentId, downloadUrl, field_id });
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
      let field_id = "";
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
        field_id = userDoc.data().Document_Id;
      } else {
        console.log(`No document found for folderId: ${folderId}`);
      }

      try {
        const result = await listAll(subfolderRef);
        for (const item of result.items) {
          try {
            const downloadUrl = await getDownloadURL(item);
            subfolderContent.push({ name: item.name, contentId: username, docCommentId, downloadUrl, folderName, field_id });
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

      const purchasedCollectionRef = collection(db, "purchased");
      const purchasedSnapshot = await getDocs(purchasedCollectionRef);

      purchasedSnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.media_name && individualContentArray.some(item => item.name === data.media_name)) {
          matchedItems.push(data);
        }
        if (data.folder_name && Array.isArray(subfolderContentArray)) {
          const isFolderMatch = subfolderContentArray.some((items) =>
            items.some((item) => item.folderName === data.folder_name)
          );

          if (isFolderMatch) {
            folderMatchedItems.push(data.folder_name);
          }
        }
      });

      setpurchaseIdentified(matchedItems);
      setUsermultiple(folderMatchedItems);
    } catch (error) {
      console.error("Error fetching purchased items:", error);
    }
  };

  const checkword = async () => {
    try {
      const userRef = doc(db, "users", userid);
      const getuserRef = await getDoc(userRef);
      if (getuserRef.exists()) {
        const data = getuserRef.data();
        const userArray = [data.name, data.email, data.phoneNumber, data.dob, data.country, data.Document_Id, data.username, data.age];

        setProfile(userArray)
        Navigate("/usersprofile")

      } else {
        console.log("No such document exists");
      }

    } catch (error) {
      console.error("Error checking document:", error);
    }
    setuserid("");
  }


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

    if (userid.length > 0) {
      checkword();
    }
    useEffect(() => {
      if (location.state && location.state.message === "success") {
          setIsVisible(true);
      }
  }, [location.state]);


  return (
    <div className='main-homepage-wrapper'>
      <div className="homepage-container">
        <div className="app xyzzz">
          {/* {message && <p className="success-message">{message}</p>} */}
          {individualContentArray.map((media, index) => (
            <div className="xyz-profile-box" key={index}>
              <div className="xyz-profile-image-container">
                <img src={pic} alt="Profile" className="xyz-profile-image-homepage" />
                <p className="xyz-user-name" onClick={() => { setuserid(media.field_id); }}>{media.contentId}</p>
              </div>
              <p className='xyz-horizontal-line'></p>
              {media.name.endsWith('.mp4') ? (
                <div className={`xyz-video-container ${purchaseIdentified.some(item => item.media_name === media.name) ? 'no-blur' : ''}`}>
                  <video id={`media-${media.name}`} className="xyz-video plyr" controls>
                    <source src={media.downloadUrl} type="video/mp4" />
                  </video>
                </div>
              ) : (
                <div className={`image-container ${purchaseIdentified.some(item => item.media_name === media.name) ? 'no-blur' : ''}`}>
                  <img id={`media-${media.name}`} className="homexyzksdab-media" src={media.downloadUrl} alt="Image" />
                </div>
              )}
              <p className="xyz-statement">{media.docCommentId}</p>

              {purchaseIdentified.some(item => item.media_name === media.name) ? (
                <div className='xyz-purchase'>
                  <img className='xyz-tick-statement' src={Tick_mark} alt="" />
                  <p className="xyz-purchase-statement">You already purchased it</p>
                </div>
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
                <p className="xyz-user-name" onClick={() => { setuserid(subfolder[0]?.field_id) }}>{subfolder[0]?.contentId || "Unknown User"}</p>
              </div>
              <p className='xyz-horizontal-line'></p>
              <div className="xyz-two-column-media-grid">
                {subfolder.map((media, subIndex) => (
                  <div
                    className={`xyz-media-item ${usermultiple.includes(subfolder[0]?.folderName) ? 'no-blur' : ''}`}
                    key={subIndex}
                  >
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

              {usermultiple.includes(subfolder[0]?.folderName) ? (
                <div className='xyz-purchase'>
                  <img className='xyz-tick-statement' src={Tick_mark} alt="" />
                  <p className="xyz-purchase-statement">You already purchased it</p>
                </div>
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
                    }}>
                    <i className="fas fa-check-circle"></i> Buy Now
                  </button>
                </div>
              )}
            </div>
          ))}

        </div>
        <div className="successful-card" style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
          <p>Purchase has been successful</p>
          <i className="fa-solid fa-times purchase-times" style={{ color: 'white', fontSize: '18px', cursor: 'pointer' }} onClick={() => setIsVisible(false)}></i>
        </div>
      </div>

    </div>
  );
};

export default Homepage;