import { createContext, useContext } from "react";

export interface NavigationContextState {
  navigateHome?: () => void;
  navigateThemen?: (id: string) => void;
  navigateToUrl?: (id: string) => void;
}

export const NavigationContext = createContext<NavigationContextState | undefined>(undefined);


export const useNavigationContext = (): NavigationContextState => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigationContext must be used within a NavigationContext.Provider");
  }
  return context;
};
