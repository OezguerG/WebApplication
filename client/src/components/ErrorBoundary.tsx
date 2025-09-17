import React, { useEffect } from "react";
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useLoginContext } from "../LoginContext";

interface ErrorFallbackProp {
  error: Error; 
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProp> = ({ error, resetErrorBoundary }) => {
  const { handleErrorLogout } = useLoginContext();
  const navigate = useNavigate();


  useEffect(() => {
    handleErrorLogout!();
  }, [handleErrorLogout]);

  const handleNavigate = () => {
    resetErrorBoundary();
    navigate("/");
  };
  return (
    <Container className="text-center mt-5">
      <h1>Ein Fehler ist aufgetreten!</h1>
      <p className="text-danger">{error.message}</p>
      <Button variant="primary" onClick={handleNavigate}>
        Zurück zur Startseite
      </Button>
    </Container>
  );
};