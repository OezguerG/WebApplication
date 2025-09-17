import { useNavigate } from "react-router-dom";
import { NavigationContext, NavigationContextState } from "./NavigationContext";



export const NavigationContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  

  const navigateHome = () => {
    navigate("/");
  }

  const navigateThemen = (id: string) => {
    navigate(`/gebiet/${id}`);
  }

  const navigateToUrl = (url: string) => {
    navigate(url);
  }

  const contextValue: NavigationContextState = {
    navigateHome,
    navigateThemen,
    navigateToUrl
  };
  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}