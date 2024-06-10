// import React from 'react'
// import "../styles/tagline.css"
// import content_creator from "../images/content_creator.jpg"

// const Tagline = () => {
//   return (
//     <div className='tagline_main_wrapper_container'>
//       <div className="tagline_main_container">
//         <p className='top_tagline'>Become a Tagline</p>
//         <img className='tagline_main_container_img' src={content_creator} alt="" />
//         <p>Click on Below to Become<a href="/"> Tagline creator</a></p>
//       </div>
//     </div>
//   )
// }

// export default Tagline;












// Tagline.js
import React from 'react';
import '../styles/tagline.css';
import contentCreatorImage from '../images/content_creator.jpg';

const Tagline = () => {
  return (
    <div className='tagline-main-wrapper-container'>
      <div className="tagline-main-container">
        <p className='top-tagline'>Become a Tagline</p>
        <img className='tagline-main-container-img' src={contentCreatorImage} alt="" />
        <button>Tagline creator</button>
      </div>
    </div>
  );
}

export default Tagline;
