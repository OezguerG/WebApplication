import React from 'react';
import { ProfResource } from '../../Resources';


type ProfProp = {
  prof: ProfResource;
};

export const Prof: React.FC<ProfProp> = ({ prof }) => {

  return (
    <div className="prof">
      <h2><strong>Prof: </strong> {prof.name}</h2>
      <p><br /></p>
      <p><strong>ID:</strong> {prof.id}</p>
      <p><strong>Titel:</strong> {prof.titel ? prof!.titel : "nicht vorhanden"}</p>
      <p><strong>CampusID:</strong> {prof.campusID}</p>
      <p><strong>Admin:</strong> {prof.admin ? "ja" : "nein"}</p>
    </div>
  );
}
