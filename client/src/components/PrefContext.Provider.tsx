import { PrefContext, PrefContextState } from "./PrefContext";



export const PrefContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { 

  const setDefaultsGebiet = (id: String) => {
    
  }

  const setDefaultsThemen = (id: string) => {
    
  }

  const setProfChanges = (id: string) => {
    
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