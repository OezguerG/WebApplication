import React, { useState } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { LinkContainer } from "./LinkContainer";
import { useLoginContext } from "../LoginContext";
import { LoginDialog } from "./LoginDialog";

export const Header: React.FC = () => {
  const { isLoggedIn, isAdmin, handleLogout } = useLoginContext();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLoginClick = () => {
    setShowLoginDialog(true);
  };
  return (
    <Navbar bg="light" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand href="/">Meine App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Übersicht</Nav.Link>
            </LinkContainer>
            {isAdmin && (
              <LinkContainer to="/admin">
                <Nav.Link>Admin</Nav.Link>
              </LinkContainer>
            )}
            {isLoggedIn && (
              <LinkContainer to="/prefs">
                <Nav.Link>Prefs</Nav.Link>
              </LinkContainer>
            )}
            {isLoggedIn && (
              <LinkContainer to="/gebiet/neu">
                <Nav.Link>Neues Gebiet</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
        {isLoggedIn ? (
          <Button variant="outline-danger" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button variant="outline-primary" onClick={handleLoginClick}>
            Login
          </Button>
        )}
        
        <LoginDialog
          show={showLoginDialog}
          onHide={() => setShowLoginDialog(false)}
        />
      </Container>
    </Navbar>
  );
};
