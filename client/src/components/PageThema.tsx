import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThemaResource } from '../Resources';
import { LoadingIndicator } from './LoadingIndicator';
import { getThema } from '../backend/api';
import { Thema } from './output/Thema';



export const PageThema: React.FC<{}> = () => {

  const { id } = useParams<{ id: string }>();
  const [thema, setThema] = useState<ThemaResource | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getThema(id!)
      .then((data) => {
        setThema(data);
      })
      .catch((err) => {
        setError("Fehler beim Laden des Themas: " + err.message);
      });
  }, [id]);

  if (error) {
    throw new Error(error);
  }

  return (
    <div className="PageThema">
      {thema !== null ? <Thema thema={thema} /> : <LoadingIndicator />}
    </div>
  );
};