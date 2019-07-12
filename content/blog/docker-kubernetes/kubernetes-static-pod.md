---
title: Kubernetes static pod
date: 2019-07-12 09:07:82
category: docker-kubernetes
---

### Static pod
스태틱 팟이 필요한 경우 /etc/kubernetes/manifests 경로에 yaml 파일을 넣어놓으면 자동으로 실행됨.
기본적으로는 kubernetes 가 운영되기 위한 스태틱 팟들이 여기 존재해서 kubernetes 시스템에 대해 트러블 슈팅이 필요한 경우 이 곳에 와서 yaml 설정파일을 확인하면 된다.
```sh
/etc/kubernetes/manifests$ ls -al
합계 24
drwxr-xr-x 2 root root 4096  7월 12 09:45 .
drwxr-xr-x 4 root root 4096  7월  9 09:59 ..
-rw------- 1 root root 1885  7월  9 09:59 etcd.yaml
-rw------- 1 root root 3262  7월  9 09:59 kube-apiserver.yaml
-rw------- 1 root root 2923  7월  9 09:59 kube-controller-manager.yaml
-rw------- 1 root root  990  7월  9 09:59 kube-scheduler.yaml
```

### Pod manual 스케쥴링


## 롤링 업데이트

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-deployment
  labels:
    app: nodejs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nodejs
  template:
    metadata:
      labels:
        app: nodejs
    spec:
      containers:
      - name: nodejs
        image: gasbugs/nodejs:v1
        ports:
        - containerPort: 8080
```

```sh
$ kubectl create -f nodejs-deploy.yaml --record=true

$ kubectl rollout history deploy nodejs-deployment
deployment.extensions/nodejs-deployment
REVISION  CHANGE-CAUSE
1         kubectl create --filename=nodejs-deploy.yaml --record=true

```

롤링 업데이트를 관찰하기 위해 아래 명령어를 실행해서 최소 대기시간을 설정한다. (실제 서비스에선 할 필요 없음)
```sh
$ kubectl patch deployments nodejs-deployment -p '{"spec": {"minReadySeconds": 10}}'
deployment.extensions/nodejs-deployment patched
```

롤링 업데이트 모니터링 python 프로그램 작성
```python
# deploy_monitor.py
import os
import time

while(1):
    os.system("kubectl get pod -o yaml | grep image > test.txt")
    f = open('test.txt')
    print(f.read())
    f.close()
    time.sleep(1)
```

yaml 파일 수정 (v1 -> v2 로 수정)
```sh
$ kubectl edit deploy nodejs-deployment
```

```sh
$ python deploy_monitor.py

    - image: gasbugs/nodejs:v2
      imagePullPolicy: IfNotPresent
      image: gasbugs/nodejs:v2
      imageID: docker-pullable://gasbugs/nodejs@sha256:3ee504aed492af9aa0f74d11bbb1c959bbeae50ea21093ef8b3600c872d5f717
    - image: gasbugs/nodejs:v2
      imagePullPolicy: IfNotPresent
      image: gasbugs/nodejs:v2
      imageID: docker-pullable://gasbugs/nodejs@sha256:3ee504aed492af9aa0f74d11bbb1c959bbeae50ea21093ef8b3600c872d5f717
    - image: gasbugs/nodejs:v1
      imagePullPolicy: IfNotPresent
      image: gasbugs/nodejs:v1
      imageID: docker-pullable://gasbugs/nodejs@sha256:5c271f2cf1344b68e139368c5f545b485cd4622d4446210f98974d899599188e
    - image: gasbugs/nodejs:v1
      imagePullPolicy: IfNotPresent
      image: gasbugs/nodejs:v1
      imageID: docker-pullable://gasbugs/nodejs@sha256:5c271f2cf1344b68e139368c5f545b485cd4622d4446210f98974d899599188e
    - image: gasbugs/nodejs:v1
      imagePullPolicy: IfNotPresent
      image: gasbugs/nodejs:v1
      imageID: docker-pullable://gasbugs/nodejs@sha256:5c271f2cf1344b68e139368c5f545b485cd4622d4446210f98974d899599188e

      ...

    - image: gasbugs/nodejs:v2
      imagePullPolicy: IfNotPresent
      image: gasbugs/nodejs:v2
      imageID: docker-pullable://gasbugs/nodejs@sha256:3ee504aed492af9aa0f74d11bbb1c959bbeae50ea21093ef8b3600c872d5f717
    - image: gasbugs/nodejs:v2
      imagePullPolicy: IfNotPresent
      image: gasbugs/nodejs:v2
      imageID: docker-pullable://gasbugs/nodejs@sha256:3ee504aed492af9aa0f74d11bbb1c959bbeae50ea21093ef8b3600c872d5f717
    - image: gasbugs/nodejs:v2
      imagePullPolicy: IfNotPresent
      image: gasbugs/nodejs:v2
      imageID: docker-pullable://gasbugs/nodejs@sha256:3ee504aed492af9aa0f74d11bbb1c959bbeae50ea21093ef8b3600c872d5f717

```
> 점진적으로 pod 이 v2로 바뀌는 것을 확인할 수 있다.


### record=true 옵션 준 후 관찰
$ kubectl rollout history deploy nodejs-deployment
deployment.extensions/nodejs-deployment
REVISION  CHANGE-CAUSE
> 현재는 기록이 없다.

$ vi nodejs-deploy.yaml
$ kubectl apply -f nodejs-deploy.yaml --record=true
Warning: kubectl apply should be used on resource created by either kubectl create --save-config or kubectl apply
deployment.apps/nodejs-deployment configured


`python deploy_monitor.py` 명령으로 전부 v3로 바뀐 것을 확인 후 히스토리를 확인해보자

$ kubectl rollout history deploy nodejs-deployment 
deployment.extensions/nodejs-deployment
REVISION  CHANGE-CAUSE
1         kubectl apply --filename=nodejs-deploy.yaml --record=true

## 롤백해보자

현재 버전업이 2번 되어 있는 상태에서 시작한다.
$ kubectl rollout history deploy nodejs-deployment
deployment.extensions/nodejs-deployment
REVISION  CHANGE-CAUSE
1         kubectl create --filename=nodejs-deploy.yaml --record=true
2         kubectl apply --filename=nodejs-deploy.yaml --record=true
3         kubectl apply --filename=nodejs-deploy.yaml --record=true

롤백명령수행
```sh
$ kubectl rollout undo deploy nodejs-deployment --to-revision=2
deployment.extensions/nodejs-deployment
```


`kubectl get deploy nodejs-deployment -o yaml` 명령어로 버전이 변경되었는지 확인해보자.
```yaml
    spec:
      containers:
      - image: gasbugs/nodejs:v2
```
변경이 잘 된 것을 확인할 수 있다.

#### 롤링 업데이트 전략 설정
maxSurge
- 기본값은 25%, 개수로도 설정 가능
- 최대로 추가 배포를 허용할 개수 설정
- 4개인 경우 25% 이면, 1개가 설정 (총 개수 5개까지 동시 pod 운영)

maxUnavailable: 
- 기본값 25%, 개수로도 설정 가능
- 동작하지 않는 포드의 개수 설정
- 4개인 경우 25% 이면, 1개가 설정 (총 개수 4-1 개는 운영되어야함)


HPA (Horizontal Pod Autoscaler) 설정
```sh
$ kubectl run php-apache --image=k8s.gcr.io/hpa-example --requests=cpu=200m --expose --port=80
kubectl run --generator=deployment/apps.v1beta1 is DEPRECATED and will be removed in a future version. Use kubectl create instead.
service/php-apache created
deployment.apps/php-apache created
```

```sh
$ kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=10
horizontalpodautoscaler.autoscaling/php-apache autoscaled
$ kubectl get hpa
NAME         REFERENCE               TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   <unknown>/50%   1         10        0          9s
```

오토스케일링을 적용한 서비스에 무한 루프 쿼리를 통해 공격 수행
```sh
$ kubectl run -i --tty load-generator --image=busybox /bin/sh
kubectl run --generator=deployment/apps.v1beta1 is DEPRECATED and will be removed in a future version. Use kubectl create instead.
If you don't see a command prompt, try pressing enter.

/ # while true; do wget -q -o- http://php-apache.default.svc.cluster.local; done
...
...
```