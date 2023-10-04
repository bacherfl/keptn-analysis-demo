// server.js
const express = require('express');
const app = express();
const k8s = require('@kubernetes/client-node');
const crypto = require('crypto');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sAppApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

app.use(express.json());

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
      const response = await k8sCustomApi.listNamespacedCustomObject('lifecycle.keptn.sh','v1alpha3','simple-go', 'keptnappversions');
      const keptnAppVersions = response.body.items;
      res.json(keptnAppVersions);
    } catch (error) {
      console.error('Error fetching KeptnAppVersions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.get('/api/keptnappversions/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const response = await k8sCustomApi.getNamespacedCustomObject('lifecycle.keptn.sh','v1alpha3','simple-go', 'keptnappversions', name);
    const keptnAppVersion = response.body;
    res.json(keptnAppVersion);
  } catch (error) {
    console.error('Error fetching KeptnAppVersions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/api/analysis/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const response = await k8sCustomApi.getNamespacedCustomObject('metrics.keptn.sh','v1alpha3','simple-go', 'analyses', name);
    const analysis = response.body;
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching Analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/api/analysis', async (req, res) => {
  console.log(req.body);
  const randomUid = crypto.randomBytes(3).toString('hex').toLowerCase(); // 6 bytes (12 characters) converted to 5-character UID
  const analysisResource = {
    apiVersion: 'metrics.keptn.sh/v1alpha3',
    kind: 'Analysis',
    metadata: {
      name: `service-analysis-${randomUid}`,
      namespace: 'simple-go'
    },
    spec: {
      timeframe: {
        from: req.body.timeframe.from,
        to: req.body.timeframe.to,
      },
      args: {
        workload: req.body.workloadName,
      },
      analysisDefinition: {
        name: 'my-analysis-definition',
      },
    },
  };

  try {
    const response = await k8sCustomApi.createNamespacedCustomObject('metrics.keptn.sh','v1alpha3','simple-go', 'analyses', analysisResource)
    res.status(201).json(response.body);
  } catch (error) {
    console.error('Error creating analysis resource:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
