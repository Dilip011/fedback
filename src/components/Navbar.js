import React, { useState, useRef, useEffect } from 'react';
import profile from "../images/Profile.jpg";
import logo from "../images/attachment.png";
import "../styles/navbar.css";
import { NavLink, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebaseconfig';
import { useUserContext } from './Usercontext';
import { useUsersearch } from "./UserContext2";
import { useSearchContext } from './SearchContext';

const Navbar = () => {
  const [searchContainerHeight, setSearchContainerHeight] = useState(55);
  const [searchHistoryVisible, setSearchHistoryVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('user');
  const [localContentIdResults, setLocalContentIdResults] = useState([]);
  const [localContentFolderIdResults, setLocalContentFolderIdResults] = useState([]);
  const searchContainerRef = useRef(null);
  const { user } = useUserContext();
  const { setId } = useUsersearch();
  const { setContentIdResults, setContentFolderIdResults } = useSearchContext();
  const Navigate = useNavigate();

  // useEffect(() => {
  //   const fetchSearchResults = async () => {
  //     if (searchTerm.trim() === '') {
  //       setSearchResults([]);
  //       setLocalContentIdResults([]);
  //       setLocalContentFolderIdResults([]);
  //       setContentIdResults([]);
  //       setContentFolderIdResults([]);
  //       return;
  //     }

  //     if (activeTab === 'user') {
  //       const usersCollection = collection(db, 'users');
  //       const q = query(usersCollection, orderBy('name'));
  //       const querySnapshot = await getDocs(q);
  //       const results = querySnapshot.docs.map(doc => doc.data());

  //       const filteredResults = results.filter(user =>
  //         user.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  //       );
  //       setSearchResults(filteredResults);
  //     } else if (activeTab === 'videos') {
  //       const commentsCollection = collection(db, 'comments');
  //       const q = query(commentsCollection);
  //       const querySnapshot = await getDocs(q);

  //       const searchWords = searchTerm.toLowerCase().split(' ');
  //       const contentIdArray = [];
  //       const contentFolderIdArray = [];

  //       querySnapshot.docs.forEach(doc => {
  //         const data = doc.data();
  //         const titleWords = data.content_title.toLowerCase().split(' ');

  //         if (searchWords.some(word => titleWords.includes(word))) {
  //           if (data.content_id) {
  //             contentIdArray.push(data.content_id);
  //           } else if (data.contentfolder_id) {
  //             contentFolderIdArray.push(data.contentfolder_id);
  //           }
  //         }
  //       });

  //       setLocalContentIdResults(contentIdArray);
  //       setLocalContentFolderIdResults(contentFolderIdArray);
  //       setContentIdResults(contentIdArray);
  //       setContentFolderIdResults(contentFolderIdArray);
  //     }
  //   };

  //   fetchSearchResults();
  // }, [searchTerm, activeTab]);


  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        setLocalContentIdResults([]);
        setLocalContentFolderIdResults([]);
        setContentIdResults([]);
        setContentFolderIdResults([]);
        return;
      }
  
      if (activeTab === 'user') {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('name'));
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs
          .filter(doc => doc.id !== user[5])  // Filter out the document with the logged-in user's ID
          .map(doc => doc.data());
  
        const filteredResults = results.filter(user =>
          user.name.toLowerCase().startsWith(searchTerm.toLowerCase())
        );
  
        setSearchResults(filteredResults);
      } else if (activeTab === 'videos') {
        const commentsCollection = collection(db, 'comments');
        const q = query(commentsCollection);
        const querySnapshot = await getDocs(q);
  
        const searchWords = searchTerm.toLowerCase().split(' ');
        const contentIdArray = [];
        const contentFolderIdArray = [];
  
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          const titleWords = data.content_title.toLowerCase().split(' ');
  
          if (searchWords.some(word => titleWords.includes(word))) {
            if (data.content_id) {
              contentIdArray.push(data.content_id);
            } else if (data.contentfolder_id) {
              contentFolderIdArray.push(data.contentfolder_id);
            }
          }
        });
  
        setLocalContentIdResults(contentIdArray);
        setLocalContentFolderIdResults(contentFolderIdArray);
        setContentIdResults(contentIdArray);
        setContentFolderIdResults(contentFolderIdArray);
      }
    };
  
    fetchSearchResults();
  }, [searchTerm, activeTab, user[5]]);
  
  

  const handleSearchBarClick = () => {
    setSearchContainerHeight(270);
    setSearchHistoryVisible(true);
    document.addEventListener('click', handleDocumentClick);
  };

  const handleDocumentClick = (event) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
      setSearchContainerHeight(55);
      setSearchHistoryVisible(false);
      document.removeEventListener('click', handleDocumentClick);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      setTimeout(() => {
        Navigate('/searchvideo');
        setSearchTerm('');
        setSearchContainerHeight(55);
      }, 300); 
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  

  return (
    <div className="navbar">
      <div className="left-xyzab">
        <img src={logo} alt="Server Down" className='left_image_xyzab' />
        <div
          className="left_search_container_wrapper"
          style={{
            height: `${searchContainerHeight}px`,
            width: "300px",
            transition: 'height 0.3s ease',
          }}
          ref={searchContainerRef}
        >
          <div className="left_search_container_xyzab">
            <i className={searchContainerHeight === 55 ? "fa-solid fa-magnifying-glass" : "fa-solid fa-xmark"}></i>
            <input
              type="text"
              placeholder='Search'
              className='left_search_bar_xyzab'
              onClick={handleSearchBarClick}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              value={searchTerm}
            />
            <p className="left_liner_xyzab" style={{ display: searchContainerHeight === 55 ? 'none' : 'block' }}></p>
            {searchContainerHeight !== 55 && (
              <div className="search-options">
                <span
                  className={`search-option ${activeTab === 'user' ? 'active' : ''}`}
                  onClick={() => handleTabClick('user')}
                >
                  User
                </span>
                <span
                  className={`search-option ${activeTab === 'videos' ? 'active' : ''}`}
                  onClick={() => handleTabClick('videos')}
                >
                  Videos
                </span>
              </div>
            )}
            <p className="left_liner_xyzab" style={{ display: searchContainerHeight === 55 ? 'none' : 'block' }}></p>
            {searchHistoryVisible && searchResults.length > 0 && activeTab === 'user' && (
              <div className="search-results-container">
                {searchResults.map((result, index) => (
                  <div key={index} className="left_search_bar_history_xyzab">
                    <img className="left_search_bar_history_xyzab_img" src={profile} alt="" />
                    <NavLink to={`/search_user/${result.username}`} className="left_search_bar_history_xyzab_navlink"
                      onClick={() =>
                        setId([result.name, result.email, result.phoneNumber, result.dob, result.country, result.Document_Id, result.username, user[5]])
                      }
                    >{result.name} </NavLink>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="right-xyzac">
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/notifications">Notifications</NavLink>
        <NavLink to="/login">Logout</NavLink>
      </div>
    </div>
  );
};

export default Navbar;
