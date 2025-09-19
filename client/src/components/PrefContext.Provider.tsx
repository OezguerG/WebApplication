import { PrefContext, PrefContextState } from "./PrefContext";



export const PrefContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { 

  const setDefaultsGebiet = () => {

  }

  const setDefaultsThemen = () => {

  }

  const setProfChanges = () => {
 
  }

  const contextValue: PrefContextState = {
    setDefaultsGebiet,
    setDefaultsThemen,
    setProfChanges
  };
  return (
    <PrefContext.Provider value={contextValue}>
      {children}
    </PrefContext.Provider>
  );
}