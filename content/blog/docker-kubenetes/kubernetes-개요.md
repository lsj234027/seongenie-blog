---
title: 04. Kubernetes 개요
date: 2019-07-08 15:07:24
category: docker-kubenetes
---

![Alt text](https://d33wubrfki0l68.cloudfront.net/1567471e7c58dc9b7d9c65dcd54e60cbf5870daa/da576/_common-resources/images/flower.png) 

쿠버네티스(Kubernetes, K8s)는 컨테이너화된 애플리케이션을 자동으로 배포, 스케일링 및 관리해주는 오픈소스 시스템이다.


> [Kubernetes official site \(en\)](https://kubernetes.io/) \
> [Kubernetes official site \(ko\)](https://kubernetes.io/ko)
---

### Kubernetes 사용의 이점
- 애플리케이션 배포 단순화
- 애플리케이션 개발 단순화
- 하드웨어 활용도 극대화
    - 실행중인 다양한 애플리케이션 구성 요소를 클러스터 노드의 가용 리소스에 맞게 서로 매치시킨다.
    - 노드의 하드웨어 리소스를 최적화
- 상태 확인 및 자가 치유
    - 애플리케이션 구성 요소와 노드 상태를 모니터링하고, 노드 장애 발생시 다른 노드로 스케쥴링한다.
    - 따라서 무중단으로 운영할 수 있고, 운영자는 장애가 발생한 노드를 나중에 처리할 수 있다.
- 오토스케일링
    - 스스로 리소스를 모니터링하고, 인스터스 수를 자동으로 조정한다.

