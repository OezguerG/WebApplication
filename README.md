# General  
This project was created as part of the *Web Engineering 2* course.  

It involves the development of a full-stack application with the following core features:  
- User authentication  
- REST API  
- Responsive UI  

**Technologies:**  
- Frontend: React  
- Backend: Node.js  
- Database: MongoDB  

---

# Installation & Tests  

If you want to run or test the project locally, please proceed as follows:  

1. Install dependencies:  
   - In the **server** folder:  
     ```bash
     cd server
     npm install
     ```  
   - In the **client** folder:  
     ```bash
     cd client
     npm install
     ```  

2. Provide SSL certificates:  
   - The project contains a **cert** folder.  
   - In **server/cert** and **client/cert**, you must place a **private key** (`private.key`) and a **public certificate** (`public.crt`).  
   - Instructions for creating self-signed certificates with OpenSSL can be found here:  
     [OpenSSL Self-Signed Certificate Guide](https://www.openssl.org/docs/manmaster/man1/openssl-req.html)  

3. Run tests:  
   - In the **server** folder:  
     ```bash
     npm test
     ```  
   - In the **client** folder:  
     ```bash
     npm test
     ```  

---

# Website Demo Instructions  

1. Start the backend server using the following link:  
   [Start Backend Server](https://webapplication-amhb.onrender.com)  

2. On that page, you will find a link to the demo website.  

3. To test the login, you can use the following user credentials and try out different features as well as user permissions:  

**User 1 – Moriarty**  
- CampusID: `459810`  
- Password: `123_abc_ABC`  

**User 2 – Holmes**  
- CampusID: `459813`  
- Password: `123_abc_ABC`  

---

# License  
This project is licensed under a custom license. It may be tested for demonstration and application purposes. Any use outside of this scope is not permitted. See [LICENSE](./LICENSE) for details.  
