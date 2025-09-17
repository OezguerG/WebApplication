import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GebietResource } from '../Resources';
import { LoadingIndicator } from './LoadingIndicator';
import { getGebiet } from '../backend/api';
import { Gebiet } from './output/Gebiet';

export const PageGebiet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [gebiet, setGebiet] = useState<GebietResource | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGebiet(id!)
      .then((data) => {
        setGebiet(data);
      })
      .catch((err) => {
        setError("Error fetching gebiet:" + err);
      });
  }, [id]);

  if (error) {
    throw new Error(error);
  }

  return (
    <div className="pageGebiet">
      {gebiet !== null ? <Gebiet gebiet={gebiet} /> : <LoadingIndicator />}
    </div>
  );
};