
import { createContext, useState, useContext } from 'react';


const UserContext = createContext();


export function UserContextPayment({ children }) {
  const [data, setData] = useState(null);
  
  return (
    <UserContext.Provider value={{ data, setData }}>
      {children}
    </UserContext.Provider>
  );
}


export function useUserpayment() {
  return useContext(UserContext);
}

