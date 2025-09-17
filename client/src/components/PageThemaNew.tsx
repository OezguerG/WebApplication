import React, { useEffect, useState } from 'react';
import { addThema, getGebiet } from '../backend/api';
import { useLoginContext } from '../LoginContext';
import { Button, Form, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigationContext } from './NavigationContext';
import { GebietResource } from '../Resources';
import { useParams } from 'react-router-dom';

export const PageThemaNew: React.FC<{}> = () => {
  const { id } = useParams<{ id: string }>();
  const [gebiet, setGebiet] = useState<GebietResource>();
  const { login } = useLoginContext();
  const { navigateToUrl } = useNavigationContext();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // editierbare Felder
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [abschluss, setAbschluss] = useState<"bsc" | "msc" | "any">("any");
  const [status, setStatus] = useState<"offen" | "reserviert">("offen");

  useEffect(() => {
    if (id) {
      getGebiet(id)
        .then((data) => {
          setGebiet(data);
        })
        .catch((err) => {
          setError("Error fetching Gebiet: " + err);
          return
        });
    } else {
      setError("Id not found in params")
      return
    }
  }, [id]);

  const checkConstraints = (titel: string, beschreibung: string): string | null => {
    if (titel.length < 3) return "Titel muss mindestens 3 Buchstaben haben";
    if (titel.length > 100) return "Titel darf maximal 100 Buchstaben haben";
    if (beschreibung.length < 1) return "Beschreibung muss mindestens 1 Buchstaben haben";
    if (beschreibung.length > 1000) return "Beschreibung darf maximal 1000 Buchstaben haben";
    return null;
  };

  const handleSave = async () => {
    try {
      if (login) {
        const validationMessage = checkConstraints(titel, beschreibung);
        if (validationMessage) {
          setWarning(validationMessage);
          return;
        }
        const data = await addThema(titel, beschreibung, gebiet!.verwalter, gebiet!.id!, abschluss, status);
        setShowConfirmation(true);
        navigateToUrl?.(`/thema/${data!.id!}`);
      } else {
        setError("No login data found");
      }
    } catch (err) {
      setError("Fehler beim Speichern: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (error) {
    throw new Error(error);
  }

  return (
    <div className="create thema">
      <Form>
        <Form.Group controlId="formName" className="mb-2">
          <Form.Label>Titel</Form.Label>
          <Form.Control
            type="text"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
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

        <Form.Group controlId="formAbschluss" className="mb-2">
          <Form.Label>Abschluss</Form.Label>
          <Form.Select
            value={abschluss}
            onChange={(e) => setAbschluss(e.target.value as "bsc" | "msc" | "any")}
          >
            <option value="any">Any</option>
            <option value="bsc">B.Sc.</option>
            <option value="msc">M.Sc.</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group controlId="formStatus" className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={status}
            onChange={(e) => setStatus(e.target.value as "offen" | "reserviert")}
          >
            <option value="offen">Offen</option>
            <option value="reserviert">Reserviert</option>
          </Form.Select>
        </Form.Group>

        <Button variant="success" onClick={handleSave}>Speichern</Button>
        <Button variant="secondary" onClick={() => navigateToUrl?.(`/gebiet/${gebiet!.id}`)}>Abbrechen</Button>
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
          <Toast.Body>Erfolgreich ein neues Thema hinzugefügt!</Toast.Body>
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
