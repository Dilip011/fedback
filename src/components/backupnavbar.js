import React, { useState, useRef, useEffect } from 'react';
import profile from "../images/Profile.jpg";
import logo from "../images/attachment.png";
import "../styles/navbar.css";
import { NavLink } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseconfig'; // Ensure you import your Firestore configuration

const Navbar = () => {
  const [searchContainerHeight, setSearchContainerHeight] = useState(55);
  const [searchHistoryVisible, setSearchHistoryVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        return;
      }
      // const normalizedSearchTerm = searchTerm.toLowerCase();
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => doc.data());
      setSearchResults(results);
    };

    fetchSearchResults();
  }, [searchTerm]);

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
              value={searchTerm}
            />
            <p className="left_liner_xyzab" style={{ display: searchContainerHeight === 55 ? 'none' : 'block' }}></p>
            {searchHistoryVisible && searchResults.length > 0 && (
              <div className="search-results-container">
                {searchResults.map((result, index) => (
                  <div key={index} className="left_search_bar_history_xyzab">
                    <img className="left_search_bar_history_xyzab_img" src={profile} alt="" />
                    <p className="left_search_bar_history_xyzab_user">{result.name}</p>
                    <i className="fa-solid fa-xmark"></i>
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
        <NavLink to="/videos">Videos</NavLink>
      </div>
    </div>
  );
};

export default Navbar;
