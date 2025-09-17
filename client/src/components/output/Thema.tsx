import React, { useState } from 'react';
import { ThemaResource } from "../../Resources";
import { Button, Form, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { useLoginContext } from '../../LoginContext';
import { editThema, delThema } from '../../backend/api';
import { useNavigationContext } from '../NavigationContext';

type ThemaProp = {
  thema: ThemaResource;
};

export const Thema: React.FC<ThemaProp> = ({ thema }) => {
  const { login } = useLoginContext();
  const { navigateToUrl } = useNavigationContext();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [deleted, setIsDeleted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // editierbare Felder
  const [titel, setTitel] = useState(thema.titel);
  const [beschreibung, setBeschreibung] = useState(thema.beschreibung);
  const [abschluss, setAbschluss] = useState(thema.abschluss);
  const [status, setStatus] = useState(thema.status);

  const checkConstraints = (titel: string, beschreibung: string): string | null => {
    if (titel.length < 3) return "Titel muss mindestens 3 Buchstaben haben";
    if (titel.length > 100) return "Titel darf maximal 100 Buchstaben haben";
    if (beschreibung.length < 1) return "Beschreibung muss mindestens 1 Buchstaben haben";
    if (beschreibung.length > 1000) return "Beschreibung darf maximal 1000 Buchstaben haben";
    return null;
  };

  const handleSave = async () => {
    try {
      const validationMessage = checkConstraints(titel, beschreibung);
      if (validationMessage) {
        setWarning(validationMessage);
        return;
      }
      await editThema(thema.id!, titel, beschreibung, status, abschluss);
      setIsEditing(false);
    } catch (err) {
      setError("Fehler beim Speichern: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDelete = async () => {
    try {
      await delThema(thema.id!);
      setIsDeleted(true);
      setShowConfirm(false);
      navigateToUrl?.(`/gebiet/${thema.gebiet}`);
    } catch (err) {
      setError("Fehler beim Löschen: " + (err instanceof Error ? err.message : String(err)));
      setShowConfirm(false);
    }
  };

  function checkEditRights() {
    return login && login.id === thema.betreuer;
  }

  if (deleted) {
    return null;
  }

  if (error) {
    throw new Error(error);
  }

  return (
    <div className="thema">
      <div className="thema-titel">
        <h2>Thema: {titel}</h2>
      </div>

      {!isEditing ? (
        <>
          <p><strong>ID:</strong> {thema.id}</p>
          <p><strong>Beschreibung:</strong> {beschreibung}</p>
          <p><strong>Abschluss:</strong> {abschluss}</p>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Betreuer:</strong> {thema.betreuer}</p>
          <p><strong>Betreuer Name:</strong> {thema.betreuerName}</p>
          <p><strong>Gebiet:</strong> {thema.gebiet}</p>
          <p><strong>Aktualisiert am:</strong> {thema.updatedAt}</p>

          {checkEditRights() && (
            <>
              <div className="d-flex">
                <Button variant="outline-dark" className="me-2" onClick={() => setIsEditing(true)}>Editieren</Button>
                <Button variant="danger" className="ms-auto" onClick={() => setShowConfirm(true)}>Löschen</Button>
              </div>
            </>
          )}
        </>
      ) : (
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
          <Button variant="secondary" onClick={() => setIsEditing(false)}>Abbrechen</Button>
        </Form>
      )}

      {/* Bestätigungs-Modal fürs Löschen */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bestätigung</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Soll das Thema <strong>{thema.titel}</strong> wirklich gelöscht werden?
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
