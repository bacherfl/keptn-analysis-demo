// kubernetesService.js
const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

async function listDeployments() {
  try {
    const response = await k8sApi.listDeploymentForAllNamespaces();
    return response.body.items;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  listDeployments,
};
