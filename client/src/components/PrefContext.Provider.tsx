import { PrefContext, PrefContextState } from "./PrefContext";



export const PrefContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { 

  const setDefaultsGebiet = (id: String) => {
    id = "2";
  }

  const setDefaultsThemen = (id: string) => {
    id = "2";
  }

  const setProfChanges = (id: string) => {
    id = "2";
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