
import React from 'react';
import "../styles/interpage.css";
import profile_img from "../images/Profile.jpg"
import { NavLink } from 'react-router-dom';
import { useUserContext } from './Usercontext';

const Interpage = () => {
  const {user} = useUserContext();
  
  return (
    <div className='Interpage_main_wrapper_rsdab'>
      <div className="main_interpage_elem_xyzab">
        <div className="cards">

          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-video"></i>
            <NavLink to={`/yourcontent/${user[6]}`}>Your Content</NavLink>
          </div>


          <div className='cards_div_xyzab'>
          <i class="fa-solid fa-plus"></i>
            <NavLink to="/createvideo">Create</NavLink>
          </div>

          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-hashtag"></i>
            <NavLink to="/tagline">Tagline</NavLink>
          </div>

          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-arrow-trend-up"></i>
            <NavLink to="/trending">Trending</NavLink>
          </div>

          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-cart-shopping"></i>
            <NavLink to="/purchases">Your purchases</NavLink>
          </div>

          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-money-bills"></i>
            <NavLink to="/">Billing</NavLink>
          </div>

          <div className='cards_div_xyzab'>
            <i class="fa-solid fa-cart-shopping"></i>
            <NavLink to="/cart">Cart</NavLink>
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




















