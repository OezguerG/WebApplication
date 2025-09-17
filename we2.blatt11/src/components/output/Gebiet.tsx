import React, { useEffect, useState } from 'react';
import { GebietResource, ThemaResource } from "../../Resources";
import { delGebiet, editGebiet, getAlleThemen } from '../../backend/api';
import { ThemaDescription } from './ThemaDescription';
import { useLoginContext } from '../../LoginContext';
import { Button, Form, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigationContext } from '../NavigationContext';

interface GebietProps {
  gebiet: GebietResource;
}

export const Gebiet: React.FC<GebietProps> = ({ gebiet }) => {
  const [themen, setThemen] = useState<ThemaResource[]>([]);
  const { login } = useLoginContext();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const { navigateHome, navigateToUrl } = useNavigationContext();

  const [isEditing, setIsEditing] = useState(false);
  const [deleted, setIsDeleted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // editierbare Felder
  const [name, setName] = useState(gebiet.name);
  const [beschreibung, setBeschreibung] = useState(gebiet.beschreibung || "");
  const [isPublic, setIsPublic] = useState(gebiet.public);
  const [closed, setClosed] = useState(gebiet.closed);

  const checkConstraints = (name: string, beschreibung: string): string | null => {
    if (name.length < 3) return "Name muss mindestens 3 Buchstaben haben";
    if (name.length > 100) return "Name darf maximal 100 Buchstaben haben";
    if (beschreibung.length < 1) return "Beschreibung muss mindestens 1 Buchstaben haben";
    if (beschreibung.length > 1000) return "Beschreibung darf maximal 1000 Buchstaben haben";
    return null;
  };

  const handleSave = async () => {
    try {
      const validationMessage = checkConstraints(name, beschreibung);
      if (validationMessage) {
        setWarning(validationMessage);
        return;
      }
      await editGebiet(gebiet.id!, name, beschreibung, gebiet.verwalter, isPublic, closed);
      setIsEditing(false);
    } catch (err) {
      setError("Fehler beim Speichern: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDelete = async () => {
    try {
      await delGebiet(gebiet.id!);
      setIsDeleted(true);
      setShowConfirm(false);
      navigateHome?.();
    } catch (err) {
      setError("Fehler beim Löschen: " + (err instanceof Error ? err.message : String(err)));
      setShowConfirm(false);
    }
  };

  function checkEditRights() {
    return login && login.id === gebiet.verwalter;
  }

  if (deleted) {
    return null;
  }

  useEffect(() => {
    getAlleThemen(gebiet.id!)
      .then((data) => {
        setThemen(data);
      })
      .catch((err) => {
        setError("Error fetching themen:" + err);
      });
  }, [gebiet]);

  function checkHasThemen() {
    if (themen.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  if (error) {
    throw new Error(error)
  }

  return (
    <div className="gebiet">
      <div className="gebiet-titel">
        <h2>Gebiet: {name}</h2>
      </div>

      {!isEditing ? (
        <>
          <p><strong>ID:</strong> {gebiet.id}</p>
          <p><strong>Beschreibung:</strong> {beschreibung || "nicht vorhanden"}</p>
          <p><strong>Öffentlich:</strong> {isPublic ? "ja" : "nein"}</p>
          <p><strong>Geschlossen:</strong> {closed ? "ja" : "nein"}</p>
          <p><strong>Verwalter:</strong> {gebiet.verwalter}</p>
          <p><strong>Verwalter Name:</strong> {gebiet.verwalterName}</p>
          <p><strong>Erstellt am:</strong> {gebiet.createdAt}</p>

          {checkEditRights() && (
            <>
              <div className="d-flex">
                <Button variant="outline-dark" className="me-2" onClick={() => setIsEditing(true)}>
                  Editieren
                </Button>
                <Button variant="outline-dark" className="me-2" onClick={() => navigateToUrl?.(`/gebiet/${gebiet.id!}/thema/neu`)}>
                  Neues Thema
                </Button>
                {!checkHasThemen() && (
                  <Button
                    variant="danger"
                    className="ms-auto"
                    onClick={() => setShowConfirm(true)}
                  >
                    Löschen
                  </Button>
                )}
              </div>
            </>
          )}
        </>
      ) : (
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
          <Button variant="secondary" onClick={() => setIsEditing(false)}>Abbrechen</Button>
        </Form>
      )}

      <hr />

      {themen.length > 0 ? (
        themen.map((thema) => (
          <ThemaDescription key={thema.id} thema={thema} />
        ))
      ) : (
        <p><strong>{`Keine Themen zu diesem Gebiet gefunden :(`}</strong></p>
      )}

      {/* Bestätigungs-Modal fürs Löschen */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bestätigung</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Soll das Gebiet <strong>{gebiet.name}</strong> wirklich gelöscht werden?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Abbrechen
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Fehler als Toast */}
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
          onClose={() => setError(null)}
          delay={5000}
          autohide
        >
          <Toast.Body>{warning}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};
