import React, { useEffect, useState } from 'react';
import { GebietResource } from '../Resources';
import { getAlleGebiete } from '../backend/api';
import { GebietDescription } from './output/GebietDescription';

import.meta.env.VITE_API_SERVER_URL
export const AlleGebiete: React.FC<{}> = ({ }) => {
  const [gebiete, setGebiete] = useState<GebietResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAlleGebiete()
      .then((data) => {
        setGebiete(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Fehler beim Laden der Gebiete: " + err.message);
        setLoading(false);
      });
  }, []);
  
  if (!gebiete) {
    return <p>Keine Gebiete gefunden.</p>;
  }

  if (error) {
    throw new Error(error);
  }

  if (loading) {
    return <p>Gebiete werden geladen...</p>;
  }
  return (
    <div>
      {gebiete.map((gebiet) => (
        <div key={gebiet.id}>
          <GebietDescription gebiet={gebiet} />
        </div>
      ))}
    </div>
  );
};