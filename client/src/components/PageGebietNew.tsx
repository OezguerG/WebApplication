import React, { useState } from 'react';
import { addGebiet } from '../backend/api';
import { useLoginContext } from '../LoginContext';
import { Button, Form, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigationContext } from './NavigationContext';

export const PageGebietNew: React.FC<{}> = () => {
  const { login } = useLoginContext();
  const { navigateHome, navigateToUrl } = useNavigationContext();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const [showConfirmation, setShowConfirmation] = useState(false);

  // editierbare Felder
  const [name, setName] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [closed, setClosed] = useState(false);

  const checkConstraints = (name: string, beschreibung: string): string | null => {
    if (name.length < 3) return "Name muss mindestens 3 Buchstaben haben";
    if (name.length > 100) return "Name darf maximal 100 Buchstaben haben";
    if (beschreibung.length < 1) return "Beschreibung muss mindestens 1 Buchstaben haben";
    if (beschreibung.length > 1000) return "Beschreibung darf maximal 1000 Buchstaben haben";
    return null;
  };

  const handleSave = async () => {
    try {
      if (!login) {
        setError("No login data found");
        return;
      }
      const validationMessage = checkConstraints(name, beschreibung);
      if (validationMessage) {
        setWarning(validationMessage);
        return;
      }
      const data = await addGebiet(name, beschreibung, login.id, isPublic, closed);
      setShowConfirmation(true);
      navigateToUrl?.(`/gebiet/${data.id}`);
    } catch (err) {
      setError("Fehler beim Speichern: " + (err instanceof Error ? err.message : String(err)));
    }
  };


  if (error) {
    throw new Error(error);
  }

  return (
    <div className="erstelle gebiet">
      <Form>
        <Form.Group controlId="formName" className="mb-2">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formBeschreibung" className="mb-2">
          <Form.Label>Beschreibung</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={beschreibung}
            onChange={(e) => setBeschreibung(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formPublic" className="mb-2">
          <Form.Check
            type="checkbox"
            label="öffentlich"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </Form.Group>

        <Form.Group controlId="formClosed" className="mb-3">
          <Form.Check
            type="checkbox"
            label="geschlossen"
            checked={closed}
            onChange={(e) => setClosed(e.target.checked)}
          />
        </Form.Group>

        <Button variant="success" onClick={handleSave}>Speichern</Button>
        <Button variant="secondary" onClick={() => navigateHome?.()}>Abbrechen</Button>
      </Form>

      {/* Confirmation as Toast */}
      <ToastContainer
        position="bottom-center"
        className="p-3"
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
        }}
      >
        <Toast
          bg="confirm"
          show={!!showConfirmation}
          onClose={() => setWarning(null)}
          delay={5000}
          autohide
        >
          <Toast.Body>Erfolgreich ein neues Gebiet hinzugefügt!</Toast.Body>
        </Toast>
      </ToastContainer>


      {/* Warnings as Toast */}
      <ToastContainer
        position="bottom-center"
        className="p-3"
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
        }}
      >
        <Toast
          bg="warning"
          show={!!warning}
          onClose={() => setWarning(null)}
          delay={5000}
          autohide
        >
          <Toast.Body>{warning}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};
