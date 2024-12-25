import React, { useState } from 'react';
import "../styles/interpage.css";
import profile_img from "../images/Profile.jpg"
import { NavLink } from 'react-router-dom';
import { useUserContext } from './Usercontext';
import { db } from './firebaseconfig';
import { getDoc, doc } from 'firebase/firestore';
import { useEffect } from 'react';

const Interpage = () => {
  const { user } = useUserContext();
  const [checktagline, setchecktagline] = useState(false);

  useEffect(() => {

    const check_tag = async () => {
      try {
        const documentId = user[5];
        const docRef = doc(db, "users", documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const hasBankName = "bankname" in data;
          const hasBankNumber = "bank_number" in data;
          const hasBankCode = "bank_code" in data;

          if (hasBankName && hasBankNumber && hasBankCode) {
            setchecktagline(true);
          } else {
            console.log("One or more required fields are missing.");
            return false;
          }
        } else {
          console.log("Document does not exist.");
          return false;
        }
      } catch (error) {
        console.error("Error checking document:", error);
        return false;
      }
    };

    check_tag();

  }, [user])



  return (
    <div className='Interpage_main_wrapper_rsdab'>
      <div className="main_interpage_elem_xyzab">
        <div className="cards">

          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-video"></i>
            <NavLink activeClassName="active" to={`/yourcontent/${user[6]}`}>Your Content</NavLink>
          </div>


          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-plus"></i>
            <NavLink to="/createvideo">Create</NavLink>
          </div>


          {!checktagline && (
            <div className='cards_div_xyzab'>
              <i class="fa-solid fa-hashtag"></i>
              <NavLink activeClassName="active" to="/tagline">Tagline</NavLink>
            </div>

          )}

          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-arrow-trend-up"></i>
            <NavLink activeClassName="active" to="/trending">Trending</NavLink>
          </div>

          <div className='cards_div_xyzab'>
            <i className="fas fa-check-circle"></i>
            <NavLink activeClassName="active" to="/purchases">Your purchases</NavLink>
          </div>

          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-money-bills"></i>
            <NavLink activeClassName="active" to="/">Billing</NavLink>
          </div>

          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-cart-shopping"></i>
            <NavLink activeClassName="active" to="/cart">Cart</NavLink>
          </div>
        </div>

        <div className="cards_div_down_xyzab">
          <NavLink to="/profile"><img src={profile_img} alt="" /></NavLink>
          <p>{user[0]}</p>

        </div>
      </div>
      <p className="Interpage_main_verticaline_rsdab"></p>
    </div>
  );
}

export default Interpage;

