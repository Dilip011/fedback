import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [contentIdResults, setContentIdResults] = useState([]);
  const [contentFolderIdResults, setContentFolderIdResults] = useState([]);

  return (
    <SearchContext.Provider value={{ contentIdResults, setContentIdResults, contentFolderIdResults, setContentFolderIdResults }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => useContext(SearchContext);
