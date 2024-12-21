
import { createContext, useState, useContext } from 'react';


const UserContext = createContext();


export function UserContextProfile({ children }) {
  const [profile, setProfile] = useState(null);
  
  return (
    <UserContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserContext.Provider>
  );
}


export function useUserprofile() {
  return useContext(UserContext);
}
