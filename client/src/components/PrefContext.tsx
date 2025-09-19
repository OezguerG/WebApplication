import { createContext, useContext } from "react";

export interface PrefContextState {
  setDefaultsGebiet?: (id: string) => void;
  setDefaultsThemen?: (id: string) => void;
  setProfChanges?: (id: string) => void;
}

export const PrefContext = createContext<PrefContextState | undefined>(undefined);


export const usePrefContextStateContext = (): PrefContextState => {
  const context = useContext(PrefContext);
  if (!context) {
    throw new Error("usePrefContext must be used within a PrefContext.Provider");
  }
  return context;
};
