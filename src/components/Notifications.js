
import React from 'react';
import profile from "../images/Profile-2.jpeg";
import "../styles/notifications.css";

const Notifications = () => {
  return (
    <div className="notifications_main_wrapper_wzxab">
      <div className="notifications_main_container_wzxab">
        <h2>Notifications</h2>
        <div className="notification_item">
          <img className="user_profile_image" src={profile} alt="User Profile" />
          <p><strong>John Doe</strong> has followed you.</p>
        </div>
        <div className="notification_item">
          <img className="user_profile_image" src={profile} alt="User Profile" />
          <p><strong>John Doe</strong>Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus harum incidunt doloremque, sapiente optio eos itaque corrupti! Enim officiis consequuntur ipsum rem in quaerat architecto iusto nobis, cumque dolorum ipsam nesciunt aut hic, libero unde sunt. Quam sit voluptas neque! Eius repellat nostrum commodi qui nobis atque laboriosam minus id?</p>
        </div>
        {/* Add more notification items as needed */}
      </div>
    </div>
  );
}

export default Notifications;