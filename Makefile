# renovate: datasource=github-tags depName=jaegertracing/jaeger
JAEGER_VERSION ?= v1.49.0
LFC_NAMESPACE ?= keptn-lifecycle-controller-system
PODTATO_NAMESPACE ?= podtato-kubectl
GRAFANA_PORT_FORWARD ?= 3000

.PHONY: install
install:
	make -C ./support/observability install
	kubectl apply -f ./support/mockserver
	make -C ./support/argo install

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
	make -C ./sample-app deploy-version-1

.PHONY: argo-install-podtatohead
argo-install-podtatohead:
	make -C ./support/argo argo-install-podtatohead

.PHONY: trigger-analysis
trigger-analysis:
	kubectl delete -f ./sample-app/analysis-instance/analysis.yaml --ignore-not-found=true && kubectl apply -f ./sample-app/analysis-instance/analysis.yaml

.PHONY: get-analysis-result
get-analysis-result:
	kubectl get analyses frontend-analysis -n podtato-kubectl -o=jsonpath='{.status.raw}' | jq .

.PHONY: undeploy-podtatohead
undeploy-podtatohead:
	make -C ./sample-app undeploy-podtatohead

.PHONY: uninstall
uninstall: undeploy-podtatohead
	make -C ../support/observability uninstall

