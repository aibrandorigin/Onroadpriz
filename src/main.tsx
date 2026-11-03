import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initNativeNetworkProxy } from './services/apiConfig';

// Initialize network proxy for native Android environment
initNativeNetworkProxy();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
