// Homepage.js
import React from 'react';

const Homepage = () => {
  return (
    <div className="app">
      <div className="profile-box">
        <div className="profile-image-container">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
            alt="Profile"
            className="profile-image-homepage"
          />
          <p className="user-name">User Name</p>
        </div>
        <div className="divider"></div>
        <p className="statement">Some statement goes here...</p>
        <div className="divider"></div>
        <div className="video-container">
          <iframe
            src="https://www.youtube.com/watch?v=VAdGW7QDJiU"
            title="Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video"
          ></iframe>

        </div>
      </div>
    </div>
  );
};

export default Homepage;
