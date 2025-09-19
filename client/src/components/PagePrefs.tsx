import React, { useEffect, useState } from 'react';
import { Prof } from './output/Prof';
import { useLoginContext } from '../LoginContext';
import { getProf } from '../backend/api';
import { LoadingIndicator } from './LoadingIndicator';
import { ProfResource } from '../Resources';

export const PagePrefs: React.FC<{}> = () => {
  const [prof, setProf] = useState<ProfResource | null>(null)
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


  if (error) {
    throw new Error(error)
  }
  return (
    <div className="pagePref">
      {prof !== null ? <Prof prof={prof}/> : <LoadingIndicator/>}
    </div>
  );
}
