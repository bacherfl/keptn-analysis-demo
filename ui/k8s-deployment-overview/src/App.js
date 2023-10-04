// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import KeptnAppVersionList from './KeptnAppVersionsList';
import KeptnAppVersionDetail from './KeptnAppVersionDetail';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Keptn App Demo
          </Typography>
        </Toolbar>
      </AppBar>
      <Router>
        <Routes>
          <Route path="/" exact element={<KeptnAppVersionList />} />
          <Route path="/keptnappversion/:id" element={<KeptnAppVersionDetail />} />
        </Routes>
      </Router>
    </Box>
    /*
    <div className="App">
      <KeptnAppVersionList />
    </div>
    */
  );
}

export default App;

