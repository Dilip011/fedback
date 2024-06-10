// // Videolinker.js
// import React from 'react';
// import { useUserContext } from './UserContext';
// import "../styles/video_linker.css";
// import Mainfilm from "../images/film.mp4";

// const Videolinker = () => {
//   const { videoId } = useUserContext();

//   return (
//     <div className='your_videos_linker_page'>
//       <div className="your_videos_linker_container">
//         <div className="custom-video-container"> 
//           <video
//             id={`video-${videoId}`}
//             className="custom-video" 
//             controls={false}
//           >
//             <source src={Mainfilm} type="video/mp4" />
//           </video>
//           <div
//             id={`controls-${videoId}`}
//             className="custom-controls"
//           >
//             <i className="fa-solid fa-play" style={{ color: '#ffffff' }}></i>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Videolinker;









// Videolinker.js
import React from 'react';

import "../styles/video_linker.css";
import Mainfilm from "../images/film.mp4";

const Videolinker = () => {
  

  return (
    <div className='your_videos_linker_page'>
      <div className="your_videos_linker_container">
        <div className="video-container">
          <video
            id={`video-${videoId}`}
            className="custom-video"
            controls={false}
          >
            <source src={Mainfilm} type="video/mp4" />
          </video>
          <div
            id={`controls-${videoId}`}
            className="custom-controls"
          >
            <i className="fa-solid fa-play" style={{ color: '#ffffff' }}></i>
          </div>
        </div>
        <div className="vertical-line"></div>
      </div>
    </div>
  );
}

export default Videolinker;
