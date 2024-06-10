
import { createContext, useState, useContext } from 'react';


const UserContext = createContext();


export function UserContextGlobal({ children }) {
  const [user, setUser] = useState(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}


export function useUserContext() {
  return useContext(UserContext);
}



















