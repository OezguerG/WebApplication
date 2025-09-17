import React, { useEffect } from "react";
import { getLogin } from "../backend/api";
import { useLoginContext } from "../LoginContext";

export const LoginManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {errorMessage, setLogin, handleErrorLogout } = useLoginContext();

  useEffect(() => {
    const fetchLoginState = async () => {
      try {
        const loginData = await getLogin();
        if (loginData) {
          setLogin!(loginData);
        } else {
          setLogin!(false);
        }
      } catch (error) {
        setLogin!(false);
        handleErrorLogout!();
      }
    };

    fetchLoginState();
  }, [setLogin, handleErrorLogout]);

  if(errorMessage){
    throw new Error(errorMessage);
  }
  return (
    <>{children}</>
  );
};
