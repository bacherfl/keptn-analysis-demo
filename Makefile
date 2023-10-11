# renovate: datasource=github-tags depName=jaegertracing/jaeger
JAEGER_VERSION ?= v1.49.0
LFC_NAMESPACE ?= keptn-lifecycle-controller-system
PODTATO_NAMESPACE ?= simple-go
GRAFANA_PORT_FORWARD ?= 3001

.PHONY: install
install:
	make -C ./support/observability install
	kubectl apply -f ./support/mockserver
	make -C ./support/argo install
	kubectl apply -f support/ui/manifest.yaml

.PHONY: port-forward-ui
port-forward-ui:
	@echo ""
	@echo "Open Keptn Demo UI in your Browser: http://localhost:3000"
	@echo "CTRL-c to stop port-forward"
	@echo ""
	kubectl port-forward -n keptn-ui svc/keptn-demo-ui 3000:80

.PHONY: port-forward-jaeger
port-forward-jaeger:
	make -C ./support/observability port-forward-jaeger

.PHONY: port-forward-grafana
port-forward-grafana:
	make -C ./support/observability port-forward-grafana GRAFANA_PORT_FORWARD=$(GRAFANA_PORT_FORWARD)

.PHONY: port-forward-prometheus
port-forward-prometheus:
	@echo ""
	@echo "Open Prometheus in your Browser: http://localhost:9090"
	@echo "CTRL-c to stop port-forward"
	@echo ""
	kubectl -n monitoring port-forward svc/prometheus-k8s 9090

.PHONY: port-forward-argo
port-forward-argo:
	@echo ""
	@echo "Open Argo in your Browser: http://localhost:8080"
	@echo "CTRL-c to stop port-forward"
	@echo ""
	kubectl port-forward svc/argocd-server -n argocd 8080:443

.PHONY: argo-login
argo-login:
	argocd admin initial-password -n argocd

.PHONY: deploy-app
deploy-app:
	make -C ./sample-app/manifests/app.yaml

.PHONY: deploy-app-v1
deploy-app-v1:
	helm upgrade -n simple-go --create-namespace --install simple-go ./simple-app/chart

.PHONY: deploy-app-v2
deploy-app-v2:
	helm upgrade -n simple-go --create-namespace --install --set serviceVersion=v2 simple-go ./simple-app/chart

.PHONY: argo-install-simple-go
argo-install-simple-go:
	make -C ./support/argo argo-install-simple-go

.PHONY: trigger-analysis
trigger-analysis:
	kubectl delete -f ./simple-app/analysis-instance/analysis.yaml --ignore-not-found=true && kubectl apply -f ./simple-app/analysis-instance/analysis.yaml

.PHONY: get-analysis-result
get-analysis-result:
	kubectl get analyses service-analysis -n simple-go -o=jsonpath='{.status.raw}' | jq .

.PHONY: undeploy
undeploy:
	kubectl delete namespace simple-go

.PHONY: uninstall
uninstall: undeploy
	make -C ../support/observability uninstall

