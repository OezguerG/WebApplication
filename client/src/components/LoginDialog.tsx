import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { login } from "../backend/api";
import { useLoginContext } from "../LoginContext";

export const LoginDialog: React.FC<{ show: boolean; onHide: () => void }> = ({ show, onHide }) => {
    const { loginHandler } = useLoginContext();
    const [campusID, setCampusID] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async () => {
        try {
            setErrorMessage("");
            const result = await login(campusID, password);
            loginHandler!(result);
            onHide();
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Login</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Abbrechen
                </Button>
                <Button variant="primary" onClick={handleLogin}>
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
