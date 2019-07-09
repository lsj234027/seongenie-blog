---
title: 05. Kubernetes 설치 및 클러스터 구성하기
date: 2019-07-09 10:07:37
category: docker-kubernetes
---

### Master 노드

> [Kubernetes 설치가이드 (en)](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

#### 위 사이트에 접속하면 중간에 아래 스크립트를 확인할 수 있다.

```sh
apt-get update && apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
apt-get update
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl
```

#### 나눠서 살펴보면, 아래는 apt key 를 추가하는 내용이다.

```sh
$ apt-get update && apt-get install -y apt-transport-https curl
$ curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
```

#### 다음으로 아래는 repository 를 추가하고 kubernetes 를 설치하는 명령이다.
```sh
$ cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
$ apt-get update
$ apt-get install -y kubelet kubeadm kubectl
$ apt-mark hold kubelet kubeadm kubectl
```

#### MASTER 노트 초기화

```sh
sudo kubeadm init
```
- 설치시 swap 에러가 발생할 수 있는데, `sudo swapoff -a` 명령어를 실행하면 에러가 발생하지 않는다.

#### Master 노드 초기화 명령어가 성공하면 다음처럼 메시지가 나온다.

```sh
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 10.0.2.7:6443 --token 9o834s.4x9n1w7znld7wjlk \
    --discovery-token-ca-cert-hash sha256:1e77fd2c1904b59847cd457ded6f728a6592b1f918a98e4bcec56fa3921d56d5 
```

#### 위에서 클러스터 초기화 후 나온 아래 명령어를 복사해서 실행한다. (쿠버네티스 설정파일을 복사해주는 명령)

```sh
$ mkdir -p $HOME/.kube
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

#### Slave 노드가 있는 경우, 동일하게 kubernetes 를 설치하고, 마스터노드 초기화 후 나온 join 명령을 복사하여 slave 노드에서 실행시키면 클러스터에 join 된다.
- `kubeadm init` 은 master 노드에서만 수행한다. (slave 에서는 실행 X)

```sh
$ kubeadm join 10.0.2.7:6443 --token 9o834s.4x9n1w7znld7wjlk \
    --discovery-token-ca-cert-hash sha256:1e77fd2c1904b59847cd457ded6f728a6592b1f918a98e4bcec56fa3921d56d5 
```

#### Master 노드에서 클러스터 노드 상태 확인하기
```sh
$ kubectl get nodes
```



