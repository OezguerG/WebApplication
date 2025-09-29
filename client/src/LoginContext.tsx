import { createContext, useContext } from "react";
import { LoginResource } from "./Resources";


export interface LoginContextState {
  login?: LoginResource | undefined | false;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  errorMessage?: string | null;
  loginHandler: (newLogin: false | LoginResource | undefined) => void;
  handleLogout: () => void;
  handleErrorLogout: () => void;
}


export const LoginContext = createContext<LoginContextState | undefined>(undefined);


export const useLoginContext = (): LoginContextState => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLoginContext must be used within a LoginContext.Provider");
  }
  return context;
};
