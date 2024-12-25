import React, { useState, useRef, useEffect } from 'react';
import profile from "../images/Profile.jpg";
import logo from "../images/attachment.png";
import "../styles/navbar.css";
import { NavLink, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs,doc,getDoc,updateDoc,addDoc } from 'firebase/firestore';
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
  const [ageFilterVisible, setAgeFilterVisible] = useState(false);
  const [selectedAgeOption, setSelectedAgeOption] = useState('');
  const [ageValue, setAgeValue] = useState(0);
  const searchContainerRef = useRef(null);
  const { user } = useUserContext();
  const { setId } = useUsersearch();
  const { setContentIdResults, setContentFolderIdResults } = useSearchContext();
  const Navigate = useNavigate();



  const handleMostSearchedUpdate = async (word) => {
    const mostSearchedCollection = collection(db, 'most_searched');
    const querySnapshot = await getDocs(mostSearchedCollection);
    const wordDoc = querySnapshot.docs.find(doc => 
      doc.data().word.toLowerCase() === word.toLowerCase()
    );
    const currentDate = new Date().toISOString().split('T')[0];

    if (wordDoc) {
      const docRef = doc(db, 'most_searched', wordDoc.id);
      await updateDoc(docRef, {
        count: wordDoc.data().count + 1,
        date: currentDate
      });
    } else {
      await addDoc(mostSearchedCollection, {
        word: word,
        date: currentDate,
        count: 1
      });
    }
  };

  

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

        const filteredResults = querySnapshot.docs
          .filter(doc => doc.id !== user[5])
          .map(doc => doc.data())
          .filter(user => {
            const userAge = parseInt(user.age, 10);
            let isAgeMatch = false;
            console.log(selectedAgeOption);
            switch (selectedAgeOption) {
              case 'less_than_7':
                isAgeMatch = userAge < 7;
                break;
              case '7-14':
                isAgeMatch = userAge >= 7 && userAge <= 14;
                break;
              case '15-25':
                isAgeMatch = userAge >= 15 && userAge <= 25;
                break;
              case '25-40':
                isAgeMatch = userAge >= 25 && userAge <= 40;
                break;
              case '40_and_above':
                isAgeMatch = userAge > 40;
                break;
              default:
                isAgeMatch = true; 
            }
            
            
            return isAgeMatch && user.name.toLowerCase().startsWith(searchTerm.toLowerCase());
          })
          ;
        setSearchResults(filteredResults);
      } else if (activeTab === 'videos') {
        // await handleMostSearchedUpdate(searchTerm);
        const commentsCollection = collection(db, 'comments');
        const q = query(commentsCollection);
        const querySnapshot = await getDocs(q);
      
        const searchWords = searchTerm.toLowerCase().split(' ');
        const contentIdArray = [];
        const contentFolderIdArray = [];
      
        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();
          const titleWords = data.content_title.toLowerCase().split(' ');
      
          if (searchWords.some(word => titleWords.includes(word))) {
            const userId = data.user_id; 
      
            
            const userDoc = await getDoc(doc(db, 'users', userId));
      
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const userAge = parseInt(userData.age, 10); 
      
              
              let isAgeMatch = false;
              switch (selectedAgeOption) {
                case 'less_than_7':
                  isAgeMatch = userAge < 7;
                  break;
                case '7-14':
                  isAgeMatch = userAge >= 7 && userAge <= 14;
                  break;
                case '15-25':
                  isAgeMatch = userAge >= 15 && userAge <= 25;
                  break;
                case '25-40':
                  isAgeMatch = userAge >= 25 && userAge <= 40;
                  break;
                case '40_and_above':
                  isAgeMatch = userAge > 40;
                  break;
                default:
                  isAgeMatch = true; 
              }
      
             
              if (isAgeMatch) {
                if (data.content_id) {
                  contentIdArray.push(data.content_id);
                } else if (data.contentfolder_id) {
                  contentFolderIdArray.push(data.contentfolder_id);
                }
              }
            }
          }
        }
      
        
        setLocalContentIdResults(contentIdArray);
        setLocalContentFolderIdResults(contentFolderIdArray);
        setContentIdResults(contentIdArray);
        setContentFolderIdResults(contentFolderIdArray);
      }
      
      
    };

    fetchSearchResults();
  }, [searchTerm, activeTab, user[5], ageFilterVisible, selectedAgeOption]);

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
      handleMostSearchedUpdate(searchTerm);
      setTimeout(() => {
        Navigate('/searchvideo');
        setSearchTerm('');
        setSearchContainerHeight(55);
      }, 300);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab !== 'filter' && ageValue === 0) {
      setAgeFilterVisible(false);
      setSelectedAgeOption('');
    } else if (ageValue !== 0) {
      setAgeFilterVisible(true);
      switch (ageValue) {
        case 1:
          setSelectedAgeOption('less_than_7');
          break;
        case 2:
          setSelectedAgeOption('7-14');
          break;
        case 3:
          setSelectedAgeOption('15-25');
          break;
        case 4:
          setSelectedAgeOption('25-40');
          break;
        case 5:
          setSelectedAgeOption('40_and_above');
          break;
        default:
          setSelectedAgeOption('');
      }
    }
  };

  const handleAgeCheckboxChange = (event) => {
    setAgeFilterVisible(event.target.checked);
    if (!event.target.checked) {
      setSelectedAgeOption('');
      setAgeValue(0);
    }
  };

  const handleAgeOptionChange = (event) => {
    const selectedOption = event.target.value;
    setSelectedAgeOption(selectedOption);

    switch (selectedOption) {
      case 'less_than_7':
        setAgeValue(1);
        break;
      case '7-14':
        setAgeValue(2);
        break;
      case '15-25':
        setAgeValue(3);
        break;
      case '25-40':
        setAgeValue(4);
        break;
      case '40_and_above':
        setAgeValue(5);
        break;
      default:
        setAgeValue(0);
    }
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
              <>
                <div className="search-options">
                  <span
                    className={`search-option ${activeTab === 'user' ? 'active' : ''}`}
                    onClick={() => handleTabClick('user')}>User
                  </span>
                  <span
                    className={`search-option ${activeTab === 'videos' ? 'active' : ''}`}
                    onClick={() => handleTabClick('videos')}>Videos
                  </span>
                  <span
                    className={`search-option ${activeTab === 'filter' ? 'active' : ''}`}
                    onClick={() => handleTabClick('filter')}>Filters
                  </span>
                </div>
                {activeTab === 'filter' && (
                  <div className="age-filter">
                    <label className="age-filter-checkbox">
                      <input
                        type="checkbox"
                        checked={ageFilterVisible}
                        onChange={handleAgeCheckboxChange}
                      />
                      Age
                    </label>
                    {ageFilterVisible && (
                      <div className="age-filter-options">
                        <label>
                          <input
                            type="checkbox"
                            value="less_than_7"
                            checked={selectedAgeOption === 'less_than_7'}
                            onChange={handleAgeOptionChange}
                          />
                          Less than 7
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            value="7-14"
                            checked={selectedAgeOption === '7-14'}
                            onChange={handleAgeOptionChange}
                          />
                          7-14
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            value="15-25"
                            checked={selectedAgeOption === '15-25'}
                            onChange={handleAgeOptionChange}
                          />
                          15-25
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            value="25-40"
                            checked={selectedAgeOption === '25-40'}
                            onChange={handleAgeOptionChange}
                          />
                          25-40
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            value="40_and_above"
                            checked={selectedAgeOption === '40_and_above'}
                            onChange={handleAgeOptionChange}
                          />
                          40 and above
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </>
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
        <NavLink activeClassName="active" to="/home">Home</NavLink>
        <NavLink activeClassName="active" to="/notifications">Notifications</NavLink>
        <NavLink activeClassName="active" to="/login">Logout</NavLink>
      </div>
    </div>
  );
};

export default Navbar;