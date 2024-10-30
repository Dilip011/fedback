import React, { useState, useRef, useEffect } from 'react';
import "../styles/yourvideos.css";
import { ref, getDownloadURL, listAll, deleteObject, } from 'firebase/storage';
import { useUserContext } from './Usercontext';
import { storage } from './firebaseconfig';
import image from "../images/Profile-2.jpeg"
import { doc, getDoc, query, collection, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseconfig';
import { useNavigate } from 'react-router-dom';


const splitPipeSeparatedId = (id) => {
  const [userId, v4Id, name] = id.split('|');
  return { name, v4Id, userId };
};


const BackupYourVideos = () => {
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPauseIconVisible, setPauseIconVisible] = useState(true);
  const mediaRef = useRef(null);
  const pauseIconTimer = useRef(null);
  const { user } = useUserContext();
  const [usersingleMedia, setUsersingleMedia] = useState([]);
  const [usermultiplebackerMedia, setUserMultiplebackerMedia] = useState([]);
  const [userfunc, setuserfunc] = useState([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [getname, setgetname] = useState(null);
  const [mediaSource, setMediaSource] = useState(null);
  const navigate = useNavigate();

  const fetchIndividualImages = async () => {
    if (user && user[5]) {
      try {
        const userMediaFolder = ref(storage, `images`);
        const mediaList = await listAll(userMediaFolder);

        const media = await Promise.all(
          mediaList.items.map(async (mediaRef) => {
            const downloadUrl = await getDownloadURL(mediaRef);
            const { userId } = splitPipeSeparatedId(mediaRef.name);

            if (userId === user[5]) {
              return {
                name: mediaRef.name,
                downloadUrl,
              };
            }

            return null;
          })
        );

        const filteredMedia = media.filter((item) => item !== null);

        setUsersingleMedia(filteredMedia);
      } catch (error) {
        console.error('Error fetching user media: ', error);
      }
    }
  };

  const fetchSubfolders = async () => {
    if (user && user[5]) {
      try {
        const userMediaFolder = ref(storage, `images`);
        const mediaList = await listAll(userMediaFolder);

        const subfoldersWithImages = await Promise.all(
          mediaList.prefixes.map(async (folderRef) => {
            const folderMediaList = await listAll(folderRef);

            try {
              const { foldername, userid, document_id } = foldersplit(folderRef.name);

              if (userid === user[5] && folderMediaList.items.length > 0) {

                const firstImageRef = folderMediaList.items[0];
                const downloadUrl = await getDownloadURL(firstImageRef);
                return {
                  name: firstImageRef.name,
                  downloadUrl
                };
              } else {
                // console.log("No matching user ID or no items in folder for", folderRef.name);
                return null
              }
            } catch (error) {
              console.error(`Error processing folder ${folderRef.name}:`, error);
            }
            return null;
          })
        );


        const filteredSubfoldersWithImages = subfoldersWithImages.filter((item) => item !== null);
        setUserMultiplebackerMedia(filteredSubfoldersWithImages);

      } catch (error) {
        console.error('Error fetching subfolders with first images: ', error);
      }
    } else {
      console.log("User or user ID is not defined.");
    }
    return [];
  };


  const foldersplit = (id) => {

    try {
      const [foldernameAndUserid, documentIdWithClosingTag] = id.split('<');
      const [foldername, userid] = foldernameAndUserid.split('|');
      const document_id = documentIdWithClosingTag.split('>')[0];
      return { foldername, userid, document_id };
    } catch (error) {
      console.error("Error splitting folder ID:", id, error);
      throw new Error(`Invalid folder ID format: ${id}`);
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

  useEffect(() => {
    if (selectedMediaId) {
      handleContent();
      handlecommentforindividualmedia();
    }
  }, [selectedMediaId]);

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

  const handleDelete = async () => {

    if (mediaSource === 'usersingleMedia') {
      const fileRef = ref(storage, `images/${getname.name}`);

      try {
        await deleteObject(fileRef);

        const commentsRef = collection(db, 'comments');
        const q = query(commentsRef, where('content_id', '==', `images/${getname.name}`));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnap) => {
          await deleteDoc(doc(db, 'comments', docSnap.id));
        });

        setSelectedMediaId(null);
        setuserfunc([]);
        setComments([]);
        navigate('/home')
      } catch (error) {
        console.error('Error deleting file or comment:', error);
      }

    } else if (mediaSource === 'userfunc') {

      const rootRef = ref(storage, 'images');
      try {
        const folderList = await listAll(rootRef);

        for (const folder of folderList.prefixes) {
          const folderRef = ref(storage, folder.fullPath);
          const fileList = await listAll(folderRef);

          const matchedFile = fileList.items.find((file) => file.name === getname.name);
          if (matchedFile) {
            for (const file of fileList.items) {
              await deleteObject(file);
            }

            const commentsRef = collection(db, 'comments');
            const q = query(commentsRef, where('contentfolder_id', '==', `${folder.fullPath}/${getname.name}`));

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (docSnap) => {
              await deleteDoc(doc(db, 'comments', docSnap.id));
            });
            setSelectedMediaId(null);
            setuserfunc([]);
            setComments([]);
            navigate('/home')
            break;
          }
        }
      } catch (error) {
        console.error('Error deleting files in subfolder:', error);
      }
    }
  };





  useEffect(() => {
    fetchIndividualImages();
    // fetchImagesInSubfolders();
    fetchSubfolders();
  }, [user]);


  return (
    <div className='backyourvideos_main_wrapper_ksdab'>
      <div className="backyourvideos_main_container_ksdab">
        {usersingleMedia && usersingleMedia.map((media) => (
          <div key={media.name} className="backksdab-media-container">
            {media.name.endsWith('.mp4') ? (
              <video
                id={`media-${media.name}`}
                className="backksdab-media"
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
                className="backksdab-media"
                src={media.downloadUrl}
                alt="Error Displaying image"
                onClick={() => {
                  setSelectedMediaId(media.name);
                }}
              />
            )}

            {media.name.endsWith('.mp4') && (
              <div className="backcustom-controls">
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











        {usermultiplebackerMedia && usermultiplebackerMedia.map((media, index) => (
          <div key={index} className="backksdab-media-container">
            <div>
              {media.type === 'video' ? (
                <video
                  id={`media-${index}`}
                  className="backksdab-media"
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
                  className="backksdab-media"
                  src={media.downloadUrl}
                  alt="Error Displaying image"
                  onClick={() => {
                    setSelectedMediaId(media.name);
                  }}
                />
              )}

              {media.type === 'video' && (
                <div className="backcustom-controls">
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
          <div className="backmedialinker-container scrollable">
            <div className="backcustom-media-container">
              <div className="backmedia-content">
                {selectedMediaId.endsWith('.mp4') ? (
                  <video
                    id={`media-${selectedMediaId}`}
                    className="backcustom-media"
                    controls={false}
                    ref={mediaRef}
                  >
                    <source src={usersingleMedia.find((media) => media.name === selectedMediaId)?.downloadUrl || userfunc[selectedGroupIndex]?.downloadUrl} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    id={`media-${selectedMediaId}`}
                    className="backcustom-media_images"
                    src={usersingleMedia.find((media) => media.name === selectedMediaId)?.downloadUrl || userfunc[selectedGroupIndex]?.downloadUrl}
                    alt={userfunc}
                  />
                )}
                {selectedMediaId.endsWith(".mp4") && (
                  <div
                    id={`controls-${selectedMediaId}`}
                    className="backmedialinker-controls"
                    onClick={handleTogglePlayPause}
                  >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ color: '#ffffff', visibility: isPauseIconVisible ? 'visible' : 'hidden' }}></i>
                  </div>
                )}
              </div>

              <div className="backvertical-line"></div>

              <div className="backblank_area_div">
                <div className="backksdab_fixed">
                  <img className='backksdab_image_comment' src={image} alt="" />
                  <div className="backksdab_name_comment">{user[0]}</div>
                  <div className="backksdab_content_comment">{comments}</div>
                </div>
                <i
                  className="fa-solid fa-times"
                  style={{ color: 'black', fontSize: '24px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedMediaId(null);
                    setuserfunc([]);
                    setComments([]);
                    setMediaSource(null);
                    setgetname(null);
                  }}
                ></i>
                {/* <div className="backupyourvideos_chevron_delete">
                  <button onClick={() => {
                    const foundMedia = usersingleMedia.find((media) => media.name === selectedMediaId);

                    if (foundMedia) {
                      setMediaSource('usersingleMedia');
                      setgetname(foundMedia);
                    } else {
                      setMediaSource('userfunc');
                      setgetname(userfunc[selectedGroupIndex]);
                    }

                    handleDelete();
                  }}>
                    Delete
                  </button>
                </div> */}

                <div className="backupyourvideos_chevron_delete">
                  <button onClick={() => {
                    const foundMedia = usersingleMedia.find((media) => media.name === selectedMediaId);

                    if (foundMedia) {
                      setMediaSource('usersingleMedia');
                      setgetname(foundMedia);
                    } else {
                      setMediaSource('userfunc');
                      setgetname(userfunc[selectedGroupIndex]);
                    }

                    handleDelete();
                  }}>
                    <i className="fa fa-trash"></i> Delete
                  </button>
                </div>


              </div>

            </div>
          </div>



          {userfunc && userfunc.length > 0 && (
            <div className="backchevrons">
              <i
                className="fa-solid fa-chevron-left chevron_yourvideo_left"
                style={{
                  color: 'black',
                  visibility: selectedGroupIndex === 0 ? 'hidden' : 'visible',
                  height: '24px',
                  width: '24px'
                }}
                onClick={handlePreviousImage}
              ></i>
              <i
                className="fa-solid fa-chevron-right chevron_yourvideo_right"
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

export default BackupYourVideos;
