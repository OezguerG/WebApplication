import React from 'react';
import { ThemaResource } from "../../Resources";
import { Button } from 'react-bootstrap';
import { useNavigationContext } from '../NavigationContext';


type ThemaProp = {
  thema: ThemaResource;
};

export const ThemaDescription: React.FC<ThemaProp> = ({ thema }) => {
  const { navigateToUrl } = useNavigationContext();
  
  return (
    <>
      <div className="thema-description">
        <div className="thema-description-titel">
          <h2>Thema: {thema.titel}</h2>
        </div>
          <p><strong>ID:</strong> {thema.id}</p>
          <p><strong>Abschluss:</strong> {thema.abschluss}</p>
          <p><strong>Status:</strong> {thema.status}</p>
          <p><strong>Betreuer:</strong> {thema.betreuer}</p>
          <p><strong>Betreuer Name:</strong> {thema.betreuerName}</p>
          <p><strong>Gebiet:</strong> {thema.gebiet}</p>
          <p><strong>Aktualisiert am:</strong> {thema.updatedAt}</p>
          <Button variant="outline-success" onClick={() => navigateToUrl?.(`/thema/${thema.id!}`)}>Details</Button>
      </div>
      
    </>
  );
};
