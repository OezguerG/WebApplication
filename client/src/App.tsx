import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageIndex } from "./components/PageIndex";
import { PageGebiet } from "./components/PageGebiet";
import { PageGebietNew } from "./components/PageGebietNew";
import { PageThema } from "./components/PageThema";
import { PageThemaNew } from "./components/PageThemaNew";
import { PageAdmin } from "./components/PageAdmin";
import { PagePrefs } from "./components/PagePrefs";
import { Header } from "./components/Header";
import { PageLogin } from "./components/PageLogin";
import { LoginContextProvider } from "./components/LoginContext.Provider";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/ErrorBoundary";
import { PrivateRoute } from "./components/PrivateRoute";
import { NavigationContextProvider } from "./components/NavigationContext.Provider";

const App: React.FC = () => {
  return (
    <LoginContextProvider>
      <NavigationContextProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <div className="app-content">
            
            <Header />
            <Routes>
              <Route path="/login" element={<PageLogin />} />
              <Route path="/" element={<PageIndex />} />
              <Route path="/gebiet/:id" element={<PageGebiet />} />
              <Route path="/gebiet/neu" element={<PageGebietNew />} />
              <Route path="/thema/:id" element={<PageThema />} />
              <Route path="/gebiet/:id/thema/neu" element={<PageThemaNew />} />
              <Route path="/admin" element={<PrivateRoute><PageAdmin /></PrivateRoute>} />
              <Route path="/prefs" element={<PrivateRoute><PagePrefs /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </ErrorBoundary>
      </NavigationContextProvider>
    </LoginContextProvider>
  );
};
export default App;