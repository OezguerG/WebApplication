test
# General  
Dieses Projekt entstand im Rahmen der Vorlesung *Webengineering 2*.  

Es handelt sich um die Entwicklung einer Full-Stack-Anwendung mit folgenden Kernfunktionen:  
- Benutzer-Authentifizierung  
- REST-API  
- Responsives UI  

**Technologien:**  
- Frontend: React  
- Backend: Node.js  
- Datenbank: MongoDB  

---

# Installation & Tests  

Falls Sie das Projekt lokal ausführen oder testen möchten, gehen Sie bitte wie folgt vor:  

1. Abhängigkeiten installieren:  
   - Im Ordner **server**:  
     ```bash
     cd server
     npm install
     ```  
   - Im Ordner **client**:  
     ```bash
     cd client
     npm install
     ```  

2. SSL-Zertifikate bereitstellen:  
   - Im Projekt befindet sich ein Ordner **cert**.  
   - In **server/cert** und **client/cert** müssen jeweils ein **privater Schlüssel** (`private.key`) und ein **öffentliches Zertifikat** (`public.crt`) abgelegt werden.  
   - Eine Anleitung zur Erstellung selbstsignierter Zertifikate mit OpenSSL finden Sie hier:  
     [OpenSSL Self-Signed Certificate Guide](https://www.openssl.org/docs/manmaster/man1/openssl-req.html)  

3. Tests ausführen:  
   - Im Ordner **server**:  
     ```bash
     npm test
     ```  
   - Im Ordner **client**:  
     ```bash
     npm test
     ```  

---

# Website Demo Instructions  

1. Starten Sie den Backend-Server über folgenden Link:  
   [Backend-Server starten](https://webapplication-amhb.onrender.com)  

2. Auf der dortigen Seite finden Sie einen Link zur Demo-Webseite.  

3. Zum Testen des Logins können Sie die folgenden Benutzerdaten verwenden und unterschiedliche Funktionen sowie Benutzerberechtigungen ausprobieren:  

**Benutzer 1 – Moriarty**  
- CampusID: `459810`  
- Passwort: `123_abc_ABC`  

**Benutzer 2 – Holmes**  
- CampusID: `459813`  
- Passwort: `123_abc_ABC`  

---

# Lizenz (License)  
Dieses Projekt steht unter einer Custom-Lizenz. Es darf für Demonstrations- und Bewerbungszwecke getestet werden. Eine Weiterverwendung außerhalb dieses Rahmens ist nicht gestattet. Siehe [LICENSE](./LICENSE) für Details.
