import React, { useEffect, useState } from 'react';
import { ProfResource } from '../../Resources';
import { useLoginContext } from '../../LoginContext';
import { getProf } from '../../backend/api';
//import { ProfResource } from "../../Resources";


export const Prof: React.FC = () => {
  const [prof, setProf] = useState<ProfResource|undefined>(undefined)
  const { login } = useLoginContext();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchProf() {
      if (login) {
        try {
          const data = await getProf(login.id);
          setProf(data);
        } catch (err) {
          setError("Error fetching prof: " + err);
        }
      }
    }

    fetchProf();
  }, [login]);

  if(error){
    throw new Error(error)
  }

  return (
    <div className="prof">
      <h2>Prof</h2>
      <p><br /></p>
      <h4>{prof!.name}</h4>
      <p><strong>ID:</strong> {prof!.id}</p>
      <p><strong>Titel:</strong> {prof!.titel ? prof!.titel : "nicht vorhanden"}</p>
      <p><strong>CampusID:</strong> {prof!.campusID}</p>
      <p><strong>Admin:</strong> {prof!.admin ? "ja" : "nein"}</p>
    </div>
  );
}
