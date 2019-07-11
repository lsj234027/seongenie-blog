---
title: 07. Kubernetes Replica Set
date: 2019-07-10 10:07:40
category: docker-kubernetes
---

### 💡 ReplicaSet 이란?
- Pod이 항상 실행되도록 유지하는 Kubernetes 리소스
- 노드가 클러스터에서 사라지는 경우, 이를 감지하고 대체 Pod을 다른 노드에 생성
- 실행 중인 Pod 의 목록을 모니터링하고, 실제 Pod 수가 원하는 Pod 수와 일치하는지 확인

### ReplicaSet vs ReplicationConroller
- ReplicaSet 은 ReplicationContoller 의 진보된 버전이다. (완전히 대체 가능)
- ReplicaSet 은 ReplicationContoller 와 유사하지만 추가적인 기능들을 사용할 수 있다.
    - 더 풍부한 표현식인 Pod 셀렉터를 사용 가능하다.
- 일부 yaml 설정이 다르다.
    - ReplicaSet: 
        - `apiVersion: apps/v1beta2`
        - `kind: ReplicaSet`
    - ReplicationController
        - `apiVersion: v1`
        - `kind: ReplicationController`

### 그렇다면 RS, RC 와 Pod 생성의 차이는 뭘까?


#### ReplicationContorller 만들기

yaml 파일 작성
```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: rc-nodejs
spec:
  replicas: 3
  selector:
    app: nodejs
  template:
    metadata:
      name: nodejs
      labels:
        app: nodejs
    spec:
      containers:
      - name: nodejs
        image: seongenie/nodejs1
        ports:
        - containerPort: 8080
```
ReplicationController 생성
```sh
$ kubectl create -f rc-nodejs.yaml
replicationcontroller/rc-nodejs created
```

생성된 RC 조회
```sh
$ kubectl get pod
NAME               READY   STATUS    RESTARTS   AGE
rc-nodejs-ddvlw    1/1     Running   0          2m19s
rc-nodejs-dv5mx    1/1     Running   0          2m19s
rc-nodejs-rdfmc    1/1     Running   0          2m19s
```

삭제 후 RC 조회
```sh
$ kubectl get pod
NAME               READY   STATUS    RESTARTS   AGE
rc-nodejs-ddvlw    1/1     Running   0          2m19s
rc-nodejs-dv5mx    1/1     Running   0          2m19s
rc-nodejs-rdfmc    1/1     Running   0          2m19s

$ kubectl delete pod rc-nodejs-ddvlw
pod "rc-nodejs-ddvlw" deleted
^C

$ kubectl get pod
NAME               READY   STATUS        RESTARTS   AGE
rc-nodejs-ddvlw    1/1     Terminating   0          3m51s
rc-nodejs-dv5mx    1/1     Running       0          3m51s
rc-nodejs-qjn56    1/1     Running       0          11s
rc-nodejs-rdfmc    1/1     Running       0          3m51s
```
삭제 명령을 실행한 Pod 이 Terminating 상태이고, 새로운 Pod가 생성된 것을 확인할 수 있다. 

이번엔 노드 자체를 내려서 장애를 강제로 발생시켜보았다.
내린 방법은 노드에 접속하여 `ifconfig eth0 down` 명령어를 실행해 네트워크를 차단했다.
이후 아래 명령어를 실행하여 끊어진 노드에 있는 __Pod__ 이 어떻게 복구되는지 확인했다.
```sh
$ kubectl get pod -o wide
rc-nodejs-dv5mx    1/1     Running   0          16m   10.8.0.8   gke-gke-test-default-pool-06f599c6-gds6   <none>
rc-nodejs-qjn56    1/1     Running   0          12m   10.8.1.5   gke-gke-test-default-pool-06f599c6-43j6   <none>
rc-nodejs-rdfmc    1/1     Running   0          16m   10.8.2.8   gke-gke-test-default-pool-06f599c6-t8sl   <none>
```

끊어진 노드 확인. NotReady 로 상태가 변경된 것을 확인했다.
```sh
$ kubectl get node
NAME                                      STATUS     ROLES    AGE   VERSION
gke-gke-test-default-pool-06f599c6-43j6   Ready      <none>   23h   v1.12.8-gke.10
gke-gke-test-default-pool-06f599c6-gds6   NotReady   <none>   23h   v1.12.8-gke.10
gke-gke-test-default-pool-06f599c6-t8sl   Ready      <none>   23h   v1.12.8-gke.10
```

아직 상태가 업데이트되지 않아 gds6 에 pod 이 Running 중이라고 되어있다. 
```sh
$ kubectl get pod -o wide
rc-nodejs-dv5mx    1/1     Running   0          16m   10.8.0.8   gke-gke-test-default-pool-06f599c6-gds6   <none>
rc-nodejs-qjn56    1/1     Running   0          12m   10.8.1.5   gke-gke-test-default-pool-06f599c6-43j6   <none>
rc-nodejs-rdfmc    1/1     Running   0          16m   10.8.2.8   gke-gke-test-default-pool-06f599c6-t8sl   <none>
```

... 몇분 후 다시 조회해 보았다. gds6 노드가 사라지고, 43j6에 새로운 pod 인 rc-nodejs-2kvct 가 생성되어 돌고 있는 것을 확인할 수 있다.
```sh
$ kubectl get pod -o wide
rc-nodejs-2kvct    1/1     Running   0          12m   10.8.1.6   gke-gke-test-default-pool-06f599c6-43j6   <none>
rc-nodejs-qjn56    1/1     Running   0          28m   10.8.1.5   gke-gke-test-default-pool-06f599c6-43j6   <none>
rc-nodejs-rdfmc    1/1     Running   0          32m   10.8.2.8   gke-gke-test-default-pool-06f599c6-t8sl   <none>
```

관리해주는 rc pod을 제거하면 복제본 pod 이 모두 제거된다.
```sh
$ kubectl delete rc rc-nodejs
replicationcontroller "rc-nodejs" deleted

$ kubectl get pod
NAME               READY   STATUS        RESTARTS   AGE
rc-nodejs-2kvct    1/1     Terminating   0          21m
rc-nodejs-qjn56    1/1     Terminating   0          37m
rc-nodejs-rdfmc    1/1     Terminating   0          40m
```
RC 하위에 관리되어지고 있던 pod들이 모두 삭제되어 지는 것을 확인할 수 있다.

### ReplicaSet 을 사용하여 Pod 생성하고 스케일링하기 (nginx 이미지 사용)
ReplicaSet yaml 파일 작성
```yaml
apiVersion: apps/v1beta2
kind: ReplicaSet
metadata:
  name: rs-nginx
spec:
  replicas: 3
  selector:
    matchExpressions:
    - key: app
      operator: In
      values:
      - nginx
  template:
    metadata:
      name: nginx
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
```

ReplicaSet 생성
```sh
$ kubectl create -f rs-nginx.yaml
replicaset.apps/rs-nginx created
```

Replica pod 10개로 스케일링하기
> `kubectl edit rs rs-nginx` 을 사용하여 yaml 파일을 직접 수정하여 적용해도 된다.
```sh
$ kubectl scale rs rs-nginx --replicas=10
replicaset.extensions/rs-nginx scaled

$ kubectl get pods
NAME               READY   STATUS              RESTARTS   AGE
rs-nginx-257qv     0/1     ContainerCreating   0          2s
rs-nginx-2bdt6     0/1     ContainerCreating   0          2s
rs-nginx-588cm     1/1     Running             0          66s
rs-nginx-6t46l     0/1     ContainerCreating   0          3s
rs-nginx-fzzmk     0/1     ContainerCreating   0          2s
rs-nginx-nv4fs     1/1     Running             0          3s
rs-nginx-ssktm     0/1     ContainerCreating   0          2s
rs-nginx-v82b4     0/1     ContainerCreating   0          3s
rs-nginx-x7vbv     1/1     Running             0          66s
```




---

## Deployment
Delpoyment 로 생성하면 RS 와 pod이 생성됨. kubectl get pods, rs
Rolling 업데이트


## Namespace
$ kubectl get pods --all-namespaces
$ kubectl get pods -n <NAMESPACE>
$ kubectl get ns
$ kubectl create ns <NAMESPACE>
$ kubectl delete ns <NAMESPACE>

