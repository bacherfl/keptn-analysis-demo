// server.js
const express = require('express');
const app = express();
const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sAppApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

app.get('/api/deployments', async (req, res) => {
  try {
    const response = await k8sAppApi.listDeploymentForAllNamespaces();
    res.json(response.body.items);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/keptnappversions', async (req, res) => {
    try {
      const response = await k8sCustomApi.listNamespacedCustomObject('lifecycle.keptn.sh','v1alpha3','podtato-kubectl', 'keptnappversions');
      const keptnAppVersions = response.body.items;
      res.json(keptnAppVersions);
    } catch (error) {
      console.error('Error fetching KeptnAppVersions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
