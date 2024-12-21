import React from 'react';
import { useUserprofile } from './Usercontext4';
import "../styles/Usersprofile.css";
import { useState, useRef, useEffect } from 'react';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
// import { useUserContext } from './Usercontext';
import { storage } from './firebaseconfig';
import image from "../images/Profile-2.jpeg"
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseconfig';
import { useUsersearch } from './UserContext2';
import { useUserpayment } from './Usercontext3';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from './Usercontext';
import cart from "../images/cart.jpg";
import { addDoc, collection } from 'firebase/firestore';
import creator from "../images/creator.jpg"

const splitPipeSeparatedId = (id) => {
    const [userId, v4Id, name] = id.split('|');
    return { name, v4Id, userId };
};

const Usersprofile = () => {
    const { profile } = useUserprofile();
    const [selectedMediaId, setSelectedMediaId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPauseIconVisible, setPauseIconVisible] = useState(true);
    const mediaRef = useRef(null);
    const pauseIconTimer = useRef(null);
    const { id } = useUsersearch();
    const { setData } = useUserpayment();
    const [usersingleMedia, setUsersingleMedia] = useState([]);
    const [usermultiplebackerMedia, setUserMultiplebackerMedia] = useState([]);
    const [userfunc, setuserfunc] = useState([]);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
    const [comments, setComments] = useState([]);
    const Navigate = useNavigate();
    const { user } = useUserContext();

    const fetchIndividualImages = async () => {
        if (profile && profile[5]) {
            try {
                const userMediaFolder = ref(storage, `images`);
                const mediaList = await listAll(userMediaFolder);

                const media = await Promise.all(
                    mediaList.items.map(async (mediaRef) => {
                        const downloadUrl = await getDownloadURL(mediaRef);
                        const { userId } = splitPipeSeparatedId(mediaRef.name);

                        if (userId === profile[5]) {
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
        if (profile && profile[5]) {
            try {
                const userMediaFolder = ref(storage, `images`);
                const mediaList = await listAll(userMediaFolder);

                const subfoldersWithImages = await Promise.all(
                    mediaList.prefixes.map(async (folderRef) => {
                        const folderMediaList = await listAll(folderRef);

                        try {
                            const { foldername, userid, document_id } = foldersplit(folderRef.name);

                            if (userid === profile[5] && folderMediaList.items.length > 0) {

                                const firstImageRef = folderMediaList.items[0];
                                const downloadUrl = await getDownloadURL(firstImageRef);
                                return {
                                    name: firstImageRef.name,
                                    downloadUrl
                                };
                            } else {
                                // console.log("No matching user ID or no items in folder for", folderRef.name);
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
            console.log("ID is not defined.");
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
                        // console.log("No such document!");
                        setComments([]);
                    }
                } else {
                    // console.log("Invalid document ID format in folder name.");
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
                        user_id: id[7]
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
                            user_id: id[7]
                        });
                        matchFound = true;
                        break;
                    }
                }
            }

            // if (matchFound) {
            //   console.log('Item added to cart successfully');
            // } else {
            //   console.log('No matching item found to add to cart');
            // }
        } catch (error) {
            console.error('Error adding item to cart: ', error);
        }
    };


    useEffect(() => {
        fetchIndividualImages();
        // fetchImagesInSubfolders();
        fetchSubfolders();
    }, [id]);



    return (
        <div className='searchyourvideos_main_wrapper_ksdabqsrt'>
            <div className="usersprofile-container">
                <div className="profile-header">
                    <div className="profile-image">
                        <img src={creator} alt="User" className="profile-avatar" />
                    </div>
                    <h2 className="profile-name">{profile[0]}</h2>
                </div>
                <div className="profile-details-container">
                    <div className="detail-frame">
                        <span className="detail-label">Username:</span>
                        <span className="detail-value">{profile[6]}</span>
                    </div>
                    <div className="detail-frame">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{profile[1]}</span>
                    </div>
                    {/* <div className="detail-frame">
                        <span className="detail-label">DOB:</span>
                        <span className="detail-value">{profile[3]}</span>
                    </div> */}
                    <div className="detail-frame">
                        <span className="detail-label">Age:</span>
                        <span className="detail-value">{profile[7]}</span>
                    </div>
                    <div className="detail-frame">
                        <span className="detail-label">Country:</span>
                        <span className="detail-value">{profile[4]}</span>
                    </div>
                </div>
            </div>
            <div className="searchyourvideos_main_container_ksdabqsrt">
                {usersingleMedia && usersingleMedia.map((media) => (
                    <div key={media.name} className="searchksdab-media-containerqsrt">
                        {media.name.endsWith('.mp4') ? (
                            <video id={`media-${media.name}`} className="searchksdab-mediaqsrt" controls={false}
                                onDragStart={(e) => e.preventDefault()} onDragOver={(e) => e.preventDefault()}
                                onDragEnter={(e) => e.preventDefault()} onDragLeave={(e) => e.preventDefault()}
                                onDrop={(e) => e.preventDefault()} onClick={() => { setSelectedMediaId(media.name); }}>
                                <source src={media.downloadUrl} type="video/mp4" />
                            </video>
                        ) : (
                            <img id={`media-${media.name}`} className="searchksdab-mediaqsrt" src={media.downloadUrl}
                                alt="Error Displaying image" onClick={() => { setSelectedMediaId(media.name); }}
                                onDragStart={(e) => e.preventDefault()} onDragOver={(e) => e.preventDefault()}
                                onDragEnter={(e) => e.preventDefault()} onDragLeave={(e) => e.preventDefault()}
                                onDrop={(e) => e.preventDefault()} />)}

                        {media.name.endsWith('.mp4') && (
                            <div className="searchcustom-controlsqsrt">
                                <i className="fa-solid fa-play" style={{ color: '#ffffff' }} onClick={() => { setSelectedMediaId(media.name); }}></i>
                            </div>)}
                    </div>
                ))}
                {usermultiplebackerMedia && usermultiplebackerMedia.map((media, index) => (
                    <div key={index} className="searchksdab-media-containerqsrt">
                        <div>
                            {media.type === 'video' ? (
                                <video id={`media-${index}`} className="searchksdab-mediaqsrt" controls={false}
                                    onDragStart={(e) => e.preventDefault()} onDragOver={(e) => e.preventDefault()}
                                    onDragEnter={(e) => e.preventDefault()} onDragLeave={(e) => e.preventDefault()}
                                    onDrop={(e) => e.preventDefault()} onClick={() => { setSelectedMediaId(media.name); }}>
                                    <source src={media.downloadUrl} type="video/mp4" />
                                </video>
                            ) : (
                                <img id={`media-${index}`} className="searchksdab-mediaqsrt" src={media.downloadUrl}
                                    alt="Error Displaying image" onClick={() => { setSelectedMediaId(media.name); }}
                                    onDragStart={(e) => e.preventDefault()} onDragOver={(e) => e.preventDefault()}
                                    onDragEnter={(e) => e.preventDefault()} onDragLeave={(e) => e.preventDefault()}
                                    onDrop={(e) => e.preventDefault()} />)}

                            {media.type === 'video' && (
                                <div className="searchcustom-controlsqsrt">
                                    <i className="fa-solid fa-play" style={{ color: '#ffffff' }}
                                        onClick={() => { setSelectedMediaId(media.url); }}></i>
                                </div>)}
                        </div>
                    </div>))}
            </div>

            {selectedMediaId && (
                <>
                    <div className="searchmedialinker-containerqsrt scrollable">
                        <div className="searchcustom-media-containerqsrt">
                            <div className="searchmedia-contentqsrt">
                                {selectedMediaId.endsWith('.mp4') ? (
                                    <video id={`media-${selectedMediaId}`} className="searchcustom-mediaqsrt"
                                        controls={false} ref={mediaRef} onDragStart={(e) => e.preventDefault()}
                                        onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => e.preventDefault()}
                                        onDragLeave={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()}>
                                        <source src={usersingleMedia.find((media) => media.name === selectedMediaId)?.downloadUrl || userfunc[selectedGroupIndex]?.downloadUrl} type="video/mp4" />
                                    </video>
                                ) : (
                                    <img
                                        id={`media-${selectedMediaId}`}
                                        className="searchcustom-media_imagesqsrt"
                                        src={usersingleMedia.find((media) => media.name === selectedMediaId)?.downloadUrl || userfunc[selectedGroupIndex]?.downloadUrl}
                                        alt={userfunc} onDragStart={(e) => e.preventDefault()} onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => e.preventDefault()} onDragLeave={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()} />)}
                                {selectedMediaId.endsWith(".mp4") && (
                                    <div id={`controls-${selectedMediaId}`} className="searchmedialinker-controlsqsrt"
                                        onClick={handleTogglePlayPause}>
                                        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ color: '#ffffff', visibility: isPauseIconVisible ? 'visible' : 'hidden' }}></i>
                                    </div>
                                )}
                            </div>

                            <div className="searchvertical-lineqsrt"></div>

                            <div className="searchblank_area_divqsrt">
                                <div className="searchksdab_fixedqsrt">
                                    <img className='searchksdab_image_commentqsrt' src={image} alt="" />
                                    <div className="searchksdab_name_commentqsrt">{profile[0]}</div>
                                    <div className="searchksdab_content_commentqsrt">{comments}</div>
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
                                <div className="searchbuy_media_ksdabqsrt">
                                    <button className="searchbuy_media_ksdab_buttonqsrt" onClick={goToNewPage}>Buy Now</button>
                                    <img onClick={addToCart} src={cart} alt="" className="searchbuy_media_ksdab_imageqsrt" />
                                </div>

                            </div>
                        </div>
                    </div>

                    {userfunc && userfunc.length > 0 && (
                        <div className="searchchevronsqsrt">
                            <i
                                className="fa-solid fa-chevron-left chevron_searchvideo_leftqsrt"
                                style={{
                                    color: 'black', visibility: selectedGroupIndex === 0 ? 'hidden' : 'visible',
                                    height: '24px', width: '24px'
                                }} onClick={handlePreviousImage} ></i>
                            <i
                                className="fa-solid fa-chevron-right chevron_searchvideo_rightqsrt"
                                style={{ color: 'black', visibility: selectedGroupIndex === userfunc.length - 1 ? 'hidden' : 'visible', height: '24px', width: '24px' }} onClick={handleNextImage}></i>
                        </div>)}
                </>
            )}
        </div>
    );
};

export default Usersprofile;
