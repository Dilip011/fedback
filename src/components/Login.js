import React from 'react'
import { useState } from 'react';
import { useUserContext } from './Usercontext';
import { useNavigate } from 'react-router-dom';
import { getDocs,collection,query,where } from 'firebase/firestore';
import { db } from './firebaseconfig';

const Login = () => {
    const Navigate = useNavigate();
    const [data, setData] = useState({
        email: '',
        password: ''
      });
    const { setUser } = useUserContext();
    
      const handleInput = (event) => {
        let newInput = { [event.target.name]: event.target.value };
        setData({ ...data, ...newInput });
      };
      const handleLogin = async (event) => {
        event.preventDefault();
    
        const { email, password } = data;
    
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.empty) {
          alert('Login failed: User not found');
          return;
        }
    
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userArray = [userData.name, userData.email, userData.phoneNumber, userData.dob, userData.country,userData.Document_Id,userData.username];
    
        if (userData.password === password && userData.email === email) {
          setTimeout(() => {
            setUser(userArray);
            Navigate("/home");
          }, 1000);
        } else {
          alert('Login failed: Incorrect password');
        }
      };
    

    return (
        <div className='login_page'>
            <div className='login_box'>
                <form className="login_input_box" action="/login">
                    <h2 className="login_top_topic">Login</h2>
                    

                    <div className="login-wrapper-input">
                        <i id="i_tags" className="fa-solid fa-envelope"></i>
                        <input
                            type="email"
                            name="email"
                            onChange={handleInput}
                            placeholder="Email"
                            autoComplete="off"
                            value={data.email}
                        />
                    </div>

                    <div className="login-wrapper-input">
                        <i id="i_tags" className="fa-solid fa-lock"></i>
                        <input
                            type="password"
                            name="password"
                            onChange={handleInput}
                            placeholder="Password"
                            autoComplete="off"
                            value={data.password}
                        />
                    </div>

                    <button className="login_button" onClick={handleLogin}>
                        Login
                    </button>

                </form>
                <p className='Not_have_Account'>Not Have Account <a className='Not_have_Account_p' href="/">Create a Account</a></p>

            </div>

        </div>
    )
}

export default Login;



