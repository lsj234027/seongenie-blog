---
title: 09. Kubernetes Storage
date: 2019-07-11 10:07:22
category: docker-kubernetes
---

## 볼륨(Volume)
볼륨은 컨테이너가 외부 스토리지에 액세스하고 공유하는 방법이다. 볼륨이 없으면 pod이 생성, 삭제, 재생성 등이 될 때 애플리케이션이 항상 초기화된 상태로 실행이 된다.
예를 들어 Jenkins 같은 경우면 pod 생성 후 job을 생성한 후 삭제 및 재생성하면 모든 job이 없어진 상태, 즉 초기화 상태로 실행이 된다는 얘기다.

### 볼륨의 종류
<div align="center">
  <table>
    <thead>
      <tr>
        <th>Temporary Volume</th>
        <th>Local Volume</th>
        <th>Network Volume</th>
        <th>Network Volume (Cloud)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>emptyDir</td>
        <td>hostpath<br/>local</td>
        <td>iSCSI<br/>NFS<br/>cephFS<br/>glusterFS<br/>...</td>
        <td>gcePersistentDisk<br/>awsEBS<br/>azureFile<br/>...</td>
      </tr>
    </tbody>
  </table>
</div>


### EmptyDir 볼륨
EmptyDir 볼륨은 공유하고 있는 모든 Pod 이 사라지면 내용도 같이 사라진다.
1. 먼저 pod yaml 파일을 생성한다. (volume 기재)

```sh
$ vi fortune-pod.yaml
```
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: fortune
spec:
  containers:
  - image: gasbugs/fortune
    name: html-generator
    volumeMounts:
    - mountPath: /var/htdocs
      name: html
  - image: httpd
    name: web-server
    volumeMounts:
    - mountPath: /usr/local/apache2/htdocs
      name: html
      readOnly: true
    ports:
    - containerPort: 80
      protocol: TCP
  volumes:
  - name: html
    emptyDir: {}
```
2. 작성한 yaml 파일로 Pod 생성 및 포트포워딩한다.

```sh
$ kubectl create -f fortune-pod.yaml
pod/fortune created

$ kubectl port-forward fortune 8080:80 &
$ Forwarding from 127.0.0.1:8080 -> 80 # kubectl port-forward 명령 실행시 자동으로 명령 실행됨

$ curl localhost:8080
Handling connection for 8080
Your mode of life will be changed for the better because of new developments.
```

3. Pod 의 컨테이너에 접속하여 볼륨이 Pod끼리 공유되고 있는지 확인한다.

```sh
$ kubectl exec -it fortune -c html-generator -- /bin/bash

root@fortune:/$ cat /var/htdocs/index.html
Cold hands, no gloves.
```

### HostPath 볼륨
- 타 디렉토리의 포드끼리 공유되지 않기 때문에 포드끼리의 데이터 공유 목적으로 사용하는 것은 좋지 않다.
- 노드간에 볼륨을 분리할 필요가 있을 때 사용
- Persistent 하다. (포드 해제 시 내용은 삭제되지 않는다.)

yaml 파일 Example
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pd
spec:
  containers:
  - image: k8s.gcr.io/test-webserver
    name: test-container
    volumeMounts:
    - mountPath: /test-pd
      name: test-volume
  volumes:
  - name: test-volume
    hostPath:
      # directory location on host
      path: /data
      # this field is optional
      type: Directory
```


### GCE 영구 스토리지
1. GCE 영구 디스크 생성을 위해 기존의 클러스터 확인
zone 체크


2. disk 생성

```sh
$ gcloud compute disks create --size=1GiB --zone=asia-northeast1-a mongodb
WARNING: You have selected a disk size of under [200GB]. This may result in poor I/O performance. For more information, see: https://developers.google.com/compute/docs/disks#performance.
Created [https://www.googleapis.com/compute/v1/projects/gke-test-246201/zones/asia-northeast1-a/disks/mongodb].
NAME     ZONE               SIZE_GB  TYPE         STATUS
mongodb  asia-northeast1-a  1        pd-standard  READY

New disks are unformatted. You must format and mount a disk before it
can be used. You can find instructions on how to do this at:

https://cloud.google.com/compute/docs/disks/add-persistent-disk#formatting
```

3. pod yaml 작성 및 생성

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mongodb
spec:
  containers:
  - image: mongo
    name: mongodb
    volumeMounts:
    - mountPath: /data/db
      name: mongo-vol
    ports:
    - containerPort: 27017
      protocol: TCP
  volumes:
  - name: mongo-vol
    # This GCE PD must already exist.
    gcePersistentDisk:
      pdName: mongodb
      fsType: ext4
```
```sh
$ kubectl create -f mongo-pod-gce.yaml
pod/mongodb created
```

4. mongodb 접속

```
$ kubectl exec -it mongodb -- mongo
```

5. 접속 후 데이터 생성

```sh
> use mystore
switched to db mystore
> db.foo.insert({name:'foo'})
WriteResult({ "nInserted" : 1 })
> db.foo.find()
{ "_id" : ObjectId("5d26b9e5c0e06bbdabc325fc"), "name" : "foo" }
```

6. 기존 몽고DB 삭제 후 몽고DB2 생성

```sh
$ kubectl delete pod monogodb
pod "mongodb" deleted
$ kubectl create -f mongo-pod-gce2.yaml
pod/mongodb2 created
```

mongodb2 로 접속
```sh
$ kubectl exec -it mongodb2 -- mongo
```

데이터 존재하는 것 확인 
```sh
> use mystore
switched to db mystore
> db.foo.find()
{ "_id" : ObjectId("5d26b9e5c0e06bbdabc325fc"), "name" : "foo" }
```