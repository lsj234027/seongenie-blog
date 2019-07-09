---
title: Kubernetes 실습하기
date: 2019-07-09 11:07:74
category: docker-kubernetes
---

```sh
$ kubectl run --generator=run/v1 nodejs --image=seognenie/nodejs --port 8080
kubectl run --generator=run/v1 is DEPRECATED and will be removed in a future version. Use kubectl create instead.
replicationcontroller/nodejs created
```

```sh
$ kubectl get pod
NAME           READY   STATUS         RESTARTS   AGE
nodejs-2d4cv   0/1     ErrImagePull   0          48s
```