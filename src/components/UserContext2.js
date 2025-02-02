import React from "react";

import { createContext, useState, useContext } from 'react';


const UserContext = createContext();


export function UserContextSearch({ children }) {
  const [id, setId] = useState(null);
  
  return (
    <UserContext.Provider value={{ id, setId }}>
      {children}
    </UserContext.Provider>
  );
}


export function useUsersearch() {
  return useContext(UserContext);
}

