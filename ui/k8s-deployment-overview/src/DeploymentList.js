// DeploymentList.js
import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import axios from 'axios';

function DeploymentList() {
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    async function fetchDeployments() {
      try {
        const response = await axios.get('/api/deployments');
        setDeployments(response.data);
      } catch (error) {
        console.error('Error fetching deployments:', error);
      }
    }

    fetchDeployments();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Kubernetes Deployments
      </Typography>
      <Paper elevation={3}>
        <List>
          {deployments.map((deployment) => (
            <ListItem key={deployment.metadata.name}>
              <ListItemText
                primary={deployment.metadata.name}
                secondary={`Replicas: ${deployment.status.replicas}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
}

export default DeploymentList;
