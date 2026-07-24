import { createContext, useContext, useState, useCallback } from 'react';

const PublicAuthContext = createContext();

// Mirrors AuthProvider but uses voterToken / voter localStorage keys.
// Fully isolated from admin/jury auth so both sessions can coexist.
export const PublicAuthProvider = ({ children }) => {
  const [voter, setVoter] = useState(() => {
    const saved = localStorage.getItem('voter');
    return saved ? JSON.parse(saved) : null;
  });
  const [isVoterLoggedIn, setIsVoterLoggedIn] = useState(() => localStorage.getItem('voterToken') !== null);

  const setVoterSession = useCallback((data) => {
    const voterData = data.voter || data;
    const token = data.token;
    setVoter(voterData);
    setIsVoterLoggedIn(true);
    if (token) localStorage.setItem('voterToken', token);
    localStorage.setItem('voter', JSON.stringify(voterData));
  }, []);

  const clearVoterSession = useCallback(() => {
    setVoter(null);
    setIsVoterLoggedIn(false);
    localStorage.removeItem('voterToken');
    localStorage.removeItem('voter');
  }, []);

  const value = {
    voter,
    isVoterLoggedIn,
    setVoterSession,
    clearVoterSession,
  };

  return (
    <PublicAuthContext.Provider value={value}>
      {children}
    </PublicAuthContext.Provider>
  );
};

export const usePublicAuth = () => {
  const context = useContext(PublicAuthContext);
  if (!context) {
    throw new Error('usePublicAuth must be used within a PublicAuthProvider');
  }
  return context;
};
