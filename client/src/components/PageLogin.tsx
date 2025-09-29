import React, { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useLoginContext } from '../LoginContext';
import { login } from '../backend/api';
import { useNavigationContext } from './NavigationContext';

export const PageLogin: React.FC = () => {
  const { loginHandler } = useLoginContext();
  const { navigateHome } = useNavigationContext();
  const [campusID, setCampusID] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      setErrorMessage("");
      const result = await login(campusID, password);
      loginHandler(result);
      navigateHome?.();
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const handleAbbruch = () => {
    navigateHome?.()
  };

  return (
    <div className="d-flex justify-content-center align-items-start vh-100">
      <div style={{ width: "100%", maxWidth: "600px", marginTop: "100px" }}>
        <h1 className="mb-4">Login</h1>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <Form>
          <Form.Group controlId="campusID">
            <Form.Label>Campus ID</Form.Label>
            <Form.Control
              type="text"
              value={campusID}
              onChange={(e) => setCampusID(e.target.value)}
              placeholder="Geben Sie Ihre Campus-ID ein"
            />
          </Form.Group>
          <Form.Group controlId="password" className="mt-3">
            <Form.Label>Passwort</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Geben Sie Ihr Passwort ein"
            />
          </Form.Group>
        </Form>
        <p></p>
        <Button variant="secondary" onClick={handleAbbruch} className="me-2">
          Abbrechen
        </Button>
        <Button variant="primary" onClick={handleLogin}>
          OK
        </Button>
      </div>
    </div>
  );
};

