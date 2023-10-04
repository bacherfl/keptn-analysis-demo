// KeptnAppVersionList.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Button, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

function KeptnAppVersionList() {
  const [KeptnAppVersions, setKeptnAppVersions] = useState([]);

  useEffect(() => {
    async function fetchKeptnAppVersions() {
      try {
        const response = await axios.get('/api/keptnappversions');
        setKeptnAppVersions(response.data);
      } catch (error) {
        console.error('Error fetching KeptnAppVersions:', error);
      }
    }

    fetchKeptnAppVersions();
  }, []);

  return (
    <div>
        {KeptnAppVersions.map((KeptnAppVersion) => (
          <Grid container item spacing={3} class="deployment-item">
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {KeptnAppVersion.metadata.name}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {KeptnAppVersion.status.status}
                  </Typography>
                  <Typography variant="body2">
                    {KeptnAppVersion.status.currentPhase}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">
                  <Link to={`/keptnappversion/${KeptnAppVersion.metadata.name}`} style={{ textDecoration: 'none' }}>
                    Details
                  </Link>
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            ))}
    </div>
  );
}

export default KeptnAppVersionList;
