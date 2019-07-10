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


## Service

svc-nodejs.yaml

apiVersion: v1
kind: Service
metadata:
  name: nodejs
spec:
  selector:
    app: nodejs
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080

서비스 생성되었는지 확인
```sh
$ kubectl get svc
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.11.240.1     <none>        443/TCP   32m
nodejs       ClusterIP   10.11.243.238   <none>        80/TCP    13s
```


Service -> Deployment -> ReplicaSet -> Pod

sessionAffinity: Client IP => 기존에 들어온 서버는 동일한 서버로 계속 연결해줌 (세션 유지, 재로그인하지 않게끔)

서비스 노출 없이 사용 (ClusterIP) FrontEnd <-> BackEnd <-> Database

서비스 노출의 세가지 방법
- NodePort: 노드 자체의 이름을 사용하여 포트를 Redirect
- LoadBalancer: 발생한 트래픽을 모든 노드의 포트로 Redirect (expose 명령에 의해 생성됨)
- Ingress: 하나의 IP 주소를 통해 여러 서비스를 제공

참고: https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0


1. Create NodePort
    1. Service yaml 파일 생성
    2. type 에 NodePort 를 지정
    3. 30000 - 32767 범위의 포트만 사용 가능
    4. 방화벽 열기 `firewall-rules create jenkins-svc-rule --allow=tcp:30002`

port: 서비스의 포트
targetPort: pod 의 포트번호
(nodePort: 최종적으로 서비스되는 포트)


nodeport yaml 작성
```yaml
apiVersion: v1
kind: Service
metadata:
  name: np-nodejs
spec:
  selector:
    app: nodejs
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
    nodePort: 30001
  type: NodePort
```

External Ip 확인
```sh
$ kubectl get node -o wide
NAME                                      STATUS   ROLES    AGE   VERSION          INTERNAL-IP   EXTERNAL-IP      OS-IMAGE                             KERNEL-VERSION   CONTAINER-RUNTIME
gke-gke-test-default-pool-06f599c6-43j6   Ready    <none>   27h   v1.12.8-gke.10   10.146.0.6    104.198.81.154   Container-Optimized OS from Google   4.14.127+        docker://17.3.2
gke-gke-test-default-pool-06f599c6-gds6   Ready    <none>   27h   v1.12.8-gke.10   10.146.0.8    34.85.1.8        Container-Optimized OS from Google   4.14.127+        docker://17.3.2
gke-gke-test-default-pool-06f599c6-t8sl   Ready    <none>   27h   v1.12.8-gke.10   10.146.0.7    35.243.64.171    Container-Optimized OS from Google   4.14.127+        docker://17.3.2
```

Service 확인
```sh
$ kubectl get svc
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
kubernetes   ClusterIP   10.11.240.1     <none>        443/TCP        60m
np-nodejs    NodePort    10.11.247.118   <none>        80:30001/TCP   48s
```

노드 외부 IP 조회
```sh
$ kubectl get node -o wide
NAME                                      STATUS   ROLES    AGE   VERSION          INTERNAL-IP   EXTERNAL-IP      OS-IMAGE                             KERNEL-VERSION   CONTAINER-RUNTIME
gke-gke-test-default-pool-06f599c6-43j6   Ready    <none>   29h   v1.12.8-gke.10   10.146.0.6    104.198.81.154   Container-Optimized OS from Google   4.14.127+        docker://17.3.2
gke-gke-test-default-pool-06f599c6-gds6   Ready    <none>   29h   v1.12.8-gke.10   10.146.0.8    34.85.1.8        Container-Optimized OS from Google   4.14.127+        docker://17.3.2
gke-gke-test-default-pool-06f599c6-t8sl   Ready    <none>   29h   v1.12.8-gke.10   10.146.0.7    35.243.64.171    Container-Optimized OS from Google   4.14.127+        docker://17.3.2
```

Curl 로 nodport 서비스 정상동작 확인
```sh
$ curl 35.243.64.171:30001
You've hit nodejs-85678cc9f9-qt88h
```

---

### LoadBalancer
LoadBalacer service yaml 작성
```yaml
apiVersion: v1
kind: Service
metadata:
  name: lb-nodejs
spec:
  selector:
    app: nodejs
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

로드밸런서 생성 및 확인
```sh
$ kubectl create -f lb-nodejs.yaml
service/lb-nodejs created

$ kubectl get svc
NAME         TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
lb-nodejs    LoadBalancer   10.11.242.41    34.85.36.3    80:31166/TCP   104s
# EXTERNAL-IP 가 Pending 인 경우 기다리세요

$ curl 34.85.36.3:80
You've hit nodejs-85678cc9f9-mn78f
```

### Ingress
- LoadBalancer 를 사용한 서비스는 자신만의 공개 IP가 각각 필요
- Ingress 는 하나의 IP로 수십 개의 서비스에 대한 액세스를 제공
www.foo.com
search.foo.com
foo.com/admin
등등

ingress yaml 작성
```yaml
apiVersion: extensions/v1beta1 # 쿠버네티스 버전 별로 다름. docs 에서 확인
kind: Ingress
metadata:
  name: test-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: www.gasbugs.com
    http:
      paths:
      - path: /
        backend:
          serviceName: np-nodejs # nodeport
          servicePort: 80
  - host: dict.gasbugs.com
    http:
      paths:
      - path: /
        backend:
          serviceName: np-nodejs # nodeport
          servicePort: 80
  - host: map.gasbugs.com
    http:
      paths:
      - path: /
        backend:
         serviceName: np-nodejs
         servicePort: 80
```

ingress 생성 확인
```sh
$ kubectl get ingress
NAME              HOSTS                                              ADDRESS        PORTS   AGE
test-ingress      www.gasbugs.com,dict.gasbugs.com,map.gasbugs.com   34.98.124.44   80      33m
```

ingress 삭제
```sh
$ kubectl delete ingress <Ingress>
```


---

### SSL 설정하기
키 생성
```sh
$ openssl genrsa -out tls.key 2048
Generating RSA private key, 2048 bit long modulus
........+++++
............................+++++
e is 65537 (0x010001)
```

인증서 생성
```sh
$ openssl req -new -x509 -key tls.key -out tls.cert -days 365 -subj /CN=www.gasbugs.com
```

```sh
$ kubectl create secret tls tls-secret --cert=tls.cert --key=tls.key
secret/tls-secret created
```