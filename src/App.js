
import React from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import "./styles/signup.css";
import "./styles/login.css";
import "./styles/profile.css";
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Login from "./components/Login";
import Homepage from './components/Homepage';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Interpage from './components/Interpage';
// import Yourvideos from './components/Yourvideos';
import Backupyourvideos from './components/backupyourvideos';
import Tagline from './components/Tagline';
import Trending from './components/Trending';
import { UserContextGlobal } from "./components/Usercontext";
import { UserContextSearch } from './components/UserContext2';
import { UserContextPayment } from './components/Usercontext3';
import SearchProfile from './components/searchprofile';
import CreateVideo from './components/Createvideo';
import Payment from './components/payment';
import Purchases from './components/purchases';
import Cart from './components/cart';



const Navlayout = () => (
  <>
    <Navbar />
    <Interpage />
    <Outlet />
  </>
);

function App() {



  return (
    <div>

      <UserContextGlobal>
        <UserContextSearch>
          <UserContextPayment>

            <Routes>
              <Route element={<Navlayout />}>


                <Route path="/home" element={<Homepage />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/yourcontent/:userId" element={<Backupyourvideos />} />
                <Route path="/tagline" element={<Tagline />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/cart" element={<Cart />} />

              </Route>

              <Route path="/createvideo" element={<CreateVideo />} />
              <Route path="/searchbar/:username" element={<SearchProfile />} />
              <Route path="/payment/:randomId" element={<Payment />} />
              
              <Route path="/" element={<Signup />} />
              <Route path="/login" element={<Login />} />

            </Routes>

          </UserContextPayment>
        </UserContextSearch>
      </UserContextGlobal>
    </div>
  );
}

export default App;
