import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';
import amplifyConfig from './amplify-config';
import '@aws-amplify/ui-react/styles.css';
import 'leaflet/dist/leaflet.css';

Amplify.configure(amplifyConfig);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);