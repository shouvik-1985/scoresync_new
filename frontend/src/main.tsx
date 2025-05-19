import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React from 'react';
import { AuthProvider } from '@/hooks/use-auth';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
