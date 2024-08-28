# Log service with K8s

* [Kubernetes dashboard](http://dawn.seli.gic.ericsson.se:30732/#!/workload?namespace=eso-logging-kubernetes-test)
* [CLI access to K8s cluster](https://confluence-nam.lmera.ericsson.se/display/ESO/Access+to+ADP+K8s+cluster)

## Create & deploy

Create namespace:

```bash
kubectl create -f k8s/eso-logging-kubernetes-test-namespace.yml
```

Create Datalake service:

```bash
kubectl create -f k8s/datalake-service.yml
```

Deploy Datalake service:

```bash
kubectl create -f k8s/datalake-deployment.yml
```

Check Datalake logs:

```bash
kubectl logs datalake-0
```

Create Log service:

```bash
kubectl create -f k8s/log-service.yml
```

Deploy Log service:

```bash
kubectl create -f k8s/log-deployment.yml
```

Deploy log writer service:

```bash
kubectl create -f k8s/log-writer-deployment.yml
```

## Delete

Delete everything:

```bash
kubectl delete -f k8s/eso-logging-kubernetes-test-namespace.yml
```

## Verify

Test services (IntelliJ 2017.3+ required): open `client.http`
