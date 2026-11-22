import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './map.css';
import './checklist.css';
import './private.css';
import { PrivateAccessProvider } from './PrivateAccess';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><PrivateAccessProvider><App /></PrivateAccessProvider></React.StrictMode>);
