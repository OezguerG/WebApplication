import React, { useCallback, useEffect, useState } from "react";
import { LoginContext, LoginContextState } from "../LoginContext";
import { useNavigate } from "react-router-dom";
import { getLogin, logout } from "../backend/api";
import { LoginResource } from "../Resources";

export const LoginContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [login, setLogin] = useState<LoginResource | undefined | false>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const loginHandler = useCallback(
    (newLogin: false | LoginResource | undefined) => {
      setLogin(newLogin);
      try {
        if (newLogin && typeof newLogin === "object") {
          setIsLoggedIn(true);
          setIsAdmin(newLogin.role === "a");
          localStorage.setItem("isLoggedIn", JSON.stringify(true));
          localStorage.setItem("isAdmin", JSON.stringify(newLogin.role));
        } else {
          setIsLoggedIn(false);
          setIsAdmin(false);
          localStorage.setItem("isLoggedIn", JSON.stringify(false));
          localStorage.setItem("isAdmin", JSON.stringify(false));
        }
      } catch (err: any) {
        setErrorMessage(err);
      }
    },
    []
  );

  const handleErrorLogout = async () => {
    try {
      if (isLoggedIn) await logout();
      setLogin(false);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setErrorMessage(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
    } catch (err: any) {
      setErrorMessage(err);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setLogin(false);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setErrorMessage(null);

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");

      await new Promise((resolve) => setTimeout(resolve, 0));
      navigate("/");
    } catch (err: any) {
      setErrorMessage(err);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchLoginState = async () => {
      try {
        const loginData = await getLogin();
        if (loginData) {
          loginHandler(loginData);
        } else {
          loginHandler(false);
        }
      } catch (err: any) {
        loginHandler(false);
        setErrorMessage(err);
      }
    };

    fetchLoginState();

  }, [login, loginHandler]);

  const contextValue: LoginContextState = {
    login,
    isLoggedIn,
    isAdmin,
    errorMessage,
    setLogin,
    handleLogout,
    handleErrorLogout,
  };
  return <LoginContext.Provider value={contextValue}>{children}</LoginContext.Provider>;
};
