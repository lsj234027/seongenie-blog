---
title: Kubernetes PV와 PVC
date: 2019-07-11 13:07:30
category: docker-kubernetes
---

## PV (PersistenceVolume)
## PVC (PersistenceVolumeClaim)


GCE 100G -> 5 pv (20G) -> 10 pvc (2g) ...

1. 몽고DB pv, pvc 작성

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-pvc
spec:
  accessModes:
    - ReadWriteOnce
  volumeMode: Filesystem
  resources:
    requests:
      storage: 1Gi
  storageClassName: ""
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongo-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
    - ReadOnlyMany
  persistentVolumeReclaimPolicy: Retain
  gcePersistentDisk:
    pdName: mongodb
    fsType: ext4
---
apiVersion: v1
kind: Pod
metadata:
  name: mongodb
spec:
  containers:
  - name: mongo
    image: mongo
    volumeMounts:
    - name: mongo-vol
      mountPath: /data/db
    ports:
    - containerPort: 27017
      protocol: TCP
  volumes:
  - name: mongo-vol
    persistentVolumeClaim:
     claimName: mongo-pvc
```

2. pvc 조회

```sh
$ kubectl get pvc
NAME        STATUS   VOLUME     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
mongo-pvc   Bound    mongo-pv   1Gi        RWO,ROX                   
```

