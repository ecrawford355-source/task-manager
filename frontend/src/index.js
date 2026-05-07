import React from 'react';
import { createRoot } from 'react-dom/client';
import NeonRunner from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NeonRunner />
  </React.StrictMode>
);
