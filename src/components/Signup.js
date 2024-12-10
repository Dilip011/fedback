import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseconfig';
import { collection, addDoc, getDocs, where, query, updateDoc } from "firebase/firestore";

const Signup = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({name: '',email: '',phoneNumber: '',dob: '',country: '',password: '',confirmPassword: '',});
  let date = new Date().getTime();
  let dataObj = new Date(date);
  let month = dataObj.getMonth();
  let year = dataObj.getFullYear();
  let DATE = dataObj.getDate();
  let Main_date = (`${DATE}/${month + 1}/${year}`);

  const handleInput = (event) => {
    let newInput = { [event.target.name]: event.target.value };

    if (event.target.name === 'password') {
      newInput.confirmPassword = data.confirmPassword;
    } else if (event.target.name === 'confirmPassword') {
      newInput.password = data.password;
    }

    setData({ ...data, ...newInput });
  };

  const handleDobInput = (event) => {
    const value = event.target.value;
    const formattedValue = value.replace(/\D/g, '');

    let formattedDob = '';

    if (formattedValue.length > 0) {
      const day = formattedValue.substring(0, 2);
      formattedDob += (parseInt(day, 10) <= 31) ? day : '';
    }

    if (formattedValue.length > 2) {
      const month = formattedValue.substring(2, 4);
      formattedDob += `/${(parseInt(month, 10) <= 12) ? month : ''}`;
    }

    if (formattedValue.length > 4) {
      const year = formattedValue.substring(4, 8);
      const currentYear = new Date().getFullYear();
      // Check if the year is less than or equal to the current year
      formattedDob += `/${(parseInt(year, 10) <= currentYear) ? year : ''}`;
    }

    setData({ ...data, dob: formattedDob });
  };

  const checkEmailExists = async (email) => {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  };

  const checkNumberExists = async (phoneNumber) => {
    const q = query(collection(db, 'users'), where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  };

  const calculateAge = (dob) => {
    const [day, month, year] = dob.split('/');
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const emailExists = await checkEmailExists(data.email);
    const numberexists = await checkNumberExists(data.phoneNumber);

    if (data.password !== data.confirmPassword) {
      alert("The passwords do not match");
      return;
    }

    try {
      if (emailExists) {
        alert("Email has already been taken");
      } else if (numberexists) {
        alert("Number has already been taken");
      } else {
        const age = calculateAge(data.dob);
        const docRef = await addDoc(collection(db, 'users'), {
          ...data,
          age,
          Timestamp: Main_date,
        });

        const newDocId = docRef.id;
        await updateDoc(docRef, {
          Document_Id: newDocId,
        });

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      console.error('Error adding data to Firestore: ', error);
    }
  };

  return (
    <div className='signup_page'>
      <div className="registration_box">
        <form className="input_box">
          <h2 className="register_top_topic">Sign Up</h2>
          <div className="wrapper-input">
            <i class="fa-solid fa-user"></i>
            <input
              type="text"
              name="name"
              onChange={handleInput}
              placeholder="Name"
              autoComplete="off"
              value={data.name}
            />
          </div>

          <div className="wrapper-input">
            <i class="fa-solid fa-user"></i>
            <input
              type="text"
              name="username"
              onChange={handleInput}
              placeholder="Enter the User Name"
              autoComplete="off"
              value={data.username}
            />
          </div>

          <div className="wrapper-input">
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

          <div className="wrapper-input">
            <i id="i_tags" className="fa-solid fa-phone" ></i>
            <input
              type="text"
              name="phoneNumber"
              onChange={handleInput}
              placeholder="Phone Number"
              autoComplete="off"
              value={data.phoneNumber}
            />
          </div>

          <div className="wrapper-input">
            <i id="i_tags" className="fa-solid fa-calendar" ></i>
            <input
              type="text"
              name="dob"
              onChange={handleDobInput}
              placeholder="Date of Birth (DD/MM/YYYY)"
              autoComplete="off"
              value={data.dob}
            />
          </div>

          <div className="wrapper-input">
            <i class="fa-sharp fa-solid fa-location-pin" ></i>
            <input
              type="text"
              name="country"
              onChange={handleInput}
              placeholder="Location"
              autoComplete="off"
              value={data.country}
            />
          </div>

          <div className="wrapper-input">
            <i id="i_tags" className="fa-solid fa-lock" ></i>
            <input
              type="password"
              name="password"
              onChange={handleInput}
              placeholder="Password"
              autoComplete="off"
              value={data.password}
            />
          </div>

          <div className="wrapper-input">
            <i id="i_tags" className="fa-solid fa-lock" ></i>
            <input
              type="password"
              name="confirmPassword"
              onChange={handleInput}
              placeholder="Confirm Password"
              autoComplete="off"
              value={data.confirmPassword}
            />
          </div>

          <button className="register_button" onClick={handleSubmit}>Register</button>
        </form>
        <p className='Have_a_account_login'>Have a Account<a className='Have_a_account_login_p' href="/login">Login</a></p>
      </div>
    </div>
  );
};

export default Signup;
