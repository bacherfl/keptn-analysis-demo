// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import KeptnAppVersionList from './KeptnAppVersionsList';
import KeptnAppVersionDetail from './KeptnAppVersionDetail';

function App() {
  return (
    <div className="App">
      <h1>Keptn</h1>
    <Router>
      <Routes>
        <Route path="/" exact element={<KeptnAppVersionList />} />
        <Route path="/keptnappversion/:id" element={<KeptnAppVersionDetail />} />
      </Routes>
    </Router>
    </div>
    /*
    <div className="App">
      <KeptnAppVersionList />
    </div>
    */
  );
}

export default App;

