# renovate: datasource=github-tags depName=jaegertracing/jaeger
JAEGER_VERSION ?= v1.49.0
LFC_NAMESPACE ?= keptn-lifecycle-controller-system
PODTATO_NAMESPACE ?= podtato-kubectl
GRAFANA_PORT_FORWARD ?= 3000

.PHONY: install
install:
	make -C ./support/observability install

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

.PHONY: deploy-app-v1
deploy-app-v1:
	make -C ./sample-app deploy-version-1

.PHONY: trigger-analysis
trigger-analysis:
	kubectl delete -f ./sample-app/analysis-instance/analysis.yaml && kubectl apply -f ./sample-app/analysis-instance/analysis.yaml

.PHONY: undeploy-podtatohead
undeploy-podtatohead:
	make -C ./sample-app undeploy-podtatohead

.PHONY: uninstall
uninstall: undeploy-podtatohead
	make -C ../support/observability uninstall

