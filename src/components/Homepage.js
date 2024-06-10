// Homepage.js
import React, { useEffect } from 'react';
import Plyr from 'plyr';
import Mainfilm from "../images/film.mp4";
import pic from "../images/Profile-2.jpeg";
import "../styles/homepage.css";


const Homepage = () => {
  useEffect(() => {
    const players = Array.from(document.querySelectorAll('.plyr'));
    players.forEach(player => new Plyr(player));
  }, []);

  return (
    <div className='main-homepage-wrapper'>
      <div className="homepage-container">
        <div className="app xyzzz">
          <div className="xyz-profile-box">
            <div className="xyz-profile-image-container">
              <img
                src={pic}
                alt="Profile"
                className="xyz-profile-image-homepage"
              />
              <p className="xyz-user-name">User Name 1</p>
            </div>

            <div className="xyz-video-container">
              <video className="xyz-video plyr" controls>
                <source src={Mainfilm} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="xyz-statement">Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat delectus quod ducimus quam ea fugiat a minus aspernatur dolor, iusto eveniet molestias beatae impedit voluptas doloremque ex enim porro qui nisi, architecto ipsam! Mollitia reprehenderit repellendus quae fugiat, cumque, quis saepe, obcaecati sequi temporibus maiores ratione? Animi neque aut maiores?</p>

            {/* Like and Dislike buttons */}
            <div className="xyz-feedback-container">
            <i class="fa-regular fa-thumbs-up selected_thumbs_up"></i>
              <span className="xyz-like-count">100</span>
              <div className="xyz-space"></div>
              <i className="fa-regular fa-thumbs-down selected_thumbs_down"></i>
              <span className="xyz-dislike-count">20</span>
            </div>
          </div>
        </div>

        <div className="app xyzzz">
          <div className="xyz-profile-box">
            <div className="xyz-profile-image-container">
              <img
                src={pic}
                alt="Profile"
                className="xyz-profile-image-homepage"
              />
              <p className="xyz-user-name">User Name 2</p>
            </div>

            <div className="xyz-video-container">
              <video className="xyz-video plyr" controls>
                <source src={Mainfilm} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="xyz-statement">Some statement goes here...</p>

            {/* Like and Dislike buttons */}
            <div className="xyz-feedback-container">
              <i class="fa-regular fa-thumbs-up selected_thumbs_up"></i>
              <span className="xyz-like-count">75</span>
              <div className="xyz-space"></div>
              <i className="fa-regular fa-thumbs-down selected_thumbs_down"></i>
              <span className="xyz-dislike-count">10</span>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default Homepage;
