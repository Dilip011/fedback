import React from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Login from "./components/Login";
import Homepage from './components/Homepage';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Interpage from './components/Interpage';
import YourVideos from "./components/Yourvideos"
import Tagline from './components/Tagline';
import Trending from './components/Trending';
import { UserContextGlobal } from "./components/Usercontext";
import { UserContextSearch } from './components/UserContext2';
import { UserContextPayment } from './components/Usercontext3';
import { UserContextProfile } from "./components/Usercontext4"
import { SearchProvider } from './components/SearchContext';
import SearchProfile from './components/searchprofile';
import CreateVideo from './components/Createvideo';
import Payment from './components/payment';
import Purchases from './components/purchases';
import Cart from './components/cart';
import Searchvideo from './components/searchvideo';
import Usersprofile from './components/Usersprofile';



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
            <SearchProvider>
              <UserContextProfile>
                <Routes>
                  <Route element={<Navlayout />}>
                    <Route path="/home" element={<Homepage />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/yourcontent/:userId" element={<YourVideos />} />
                    <Route path="/tagline" element={<Tagline />} />
                    <Route path="/trending" element={<Trending />} />
                    <Route path="/purchases" element={<Purchases />} />
                    <Route path="/cart" element={<Cart />} />
                  </Route>

                  <Route path="/createvideo" element={<CreateVideo />} />
                  <Route path="/search_user/:username" element={<SearchProfile />} />
                  <Route path="/payment/:randomId" element={<Payment />} />
                  <Route path="/searchvideo" element={<Searchvideo />} />
                  <Route path="/" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/usersprofile" element={<Usersprofile />} />
                </Routes>
              </UserContextProfile>
            </SearchProvider>
          </UserContextPayment>
        </UserContextSearch>
      </UserContextGlobal>
    </div>
  );
}

export default App;
