import React from 'react';
import { GebietResource } from "../../Resources";
import { Button } from 'react-bootstrap';
import { useNavigationContext } from '../NavigationContext';


type GebietProp = {
  gebiet: GebietResource;
};

export const GebietDescription: React.FC<GebietProp> = ({ gebiet }) => {
  const { navigateThemen } = useNavigationContext();
  return (
    <div className="gebiet-description">
      <div className="gebiet-description-titel">
        <h2>Gebiet: {gebiet.name}</h2>
      </div>
        <p><strong>ID:</strong> {gebiet.id}</p>
        <p><strong>Öffentlich:</strong> {gebiet.public ? "ja" : "nein"}</p>
        <p><strong>Geschlossen:</strong> {gebiet.closed ? "ja" : "nein"}</p>
        <p><strong>Verwalter:</strong> {gebiet.verwalter}</p>
        <p><strong>Verwalter Name:</strong> {gebiet.verwalterName}</p>
        <p><strong>Erstellt am:</strong> {gebiet.createdAt}</p>
        
        <Button variant="dark" onClick={() => navigateThemen?.("" + gebiet.id)}>
          <strong>Themen</strong>
        </Button>
    </div>
  );
};
