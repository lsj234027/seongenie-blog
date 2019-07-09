---
title: Kubernetes 실습하기
date: 2019-07-09 11:07:74
category: docker-kubernetes
---

yaml 없이 pod 생성하기 (권장하지 않는다.)
```sh
$ kubectl run --generator=run/v1 nodejs --image=seongenie/nodejs --port 8080  
kubectl run --generator=run/v1 is DEPRECATED and will be removed in a future version. Use kubectl create instead.
replicationcontroller/nodejs created
```

```sh
$ kubectl get pod
NAME           READY   STATUS         RESTARTS   AGE
nodejs-2d4cv   1/1     RUNNING        0          48s
```
---
$ kubectl get node
$ kubectl get svc
$ kubectl get pod -o wide
$ kubectl get pod -o yaml
$ kubectl get rc nodejs4 get pod -o yaml
$ kubectl describe rc nodejs4

-n 네임스페이스
$ kubectl get all -n nginx-1

<자원이름>-<포드이름>-<네임스페이스>
```sh
$ vi pod-nodejs.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nodejs1-manual
spec:
  containers:
  - name: nodejs
    image: seongenie/nodejs1
    ports:
    - containerPort: 8080
      protocol: TCP
$ kubectl create -f pod-nodejs.yaml
$ kubectl get pod
$ kubectl get pod nodejs1-manual -o yaml
$ kubectl logs nodejs1-manual
```
udemy certified kubernetes administrator with practice tests (cka 자격증)

- 백그라운드 수행: `ctrl + z`, `bg`

#### jenkins 실습
```sh
$ vi pod-jenkins.yaml // pod yaml 작성
# pod-jenkins.yaml
apiVersion: v1
kind: Pod
metadata:
  name: jenkins-manual
spec:
  containers:
  - name: jenkins
    image: jenkins
    ports:
    - containerPort: 8080
      protocol: TCP
$ kubectl create -f pod-jenkins.yaml // yaml 파일로 pod 생성 및 실행
$ kubectl port-forward jenkins-manual 8888:8080 // pod 포트포워딩
$ curl localhost:8888
$ kubectl exec jenkins-manual -- curl localhost:8080 // pod 안에서 명령 수행
$ kubectl get pod jenkins-manual -o yaml // pod 설정 yaml 로 출력
$ kubectl delete pod <POD_NAME> // POD_NAME 의 pod 삭제
$ kubectl delete pod --all // 쿠버네티스 pod 전부 삭제
$ kubectl delete all --all // 쿠버네티스 리소스 전부 삭제
```


### 레이블링 실습

```sh
vi pod-nodejs-label.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nodejs-manual-v2
  labels:
    creation_method: manual
    env: prod
spec:
  containers:
  - name: nodejs
    image: gasbugs/nodejs
    ports:
    - containerPort: 8080
      protocol: TCP
$ kubectl get pod --show-labels // pod 조회 (라벨도 같이 조회)
$ kubectl label pod nodejs-manual-v2 test=foo // 라벨 추가 (--overwrite 뒤에 추가시 기존에 이미 있는 라벨 덮어쓰기 가능)
$ kubectl get pod -L 'env,test' // (pod 조회, env, test 라벨 컬럼)
$ kubectl get pod (--show-labels) -l env=prod // (해당 키, 밸류가 같은 pod 조회, 필터링)
```