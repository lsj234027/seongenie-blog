---
title: docker 시작하기
date: 2019-07-07 18:07:16
category: docker / kubenetes
---


Docker 설치는 각 환경에 맞게 여러가지 방법이 존재한다.
위 참고 사이트에 접속하여 OS를 선택하여 
본 글은 Ubuntu 환경으로 설치하겠습니다. 
> [Docker docs](https://docs.docker.com/) \
> [Docker ubuntu install guide](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

---


1. apt package를 업데이트 한다.

```sh
$ sudo apt-get update
```

2. Install packages to allow apt to use a repository over HTTPS:

```sh
$ sudo apt-get install \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg-agent \
        software-properties-common
```

3. Add Docker’s official GPG key:

```sh
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

4. fingerprint 입력 
Verify that you now have the key with the fingerprint 9DC8 5822 9FC7 DD38 854A E2D8 8D81 803C 0EBF CD88, by searching for the last 8 characters of the fingerprint.

```sh
$ sudo apt-key fingerprint 0EBFCD88
    
pub   rsa4096 2017-02-22 [SCEA]
      9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
uid           [ unknown] Docker Release (CE deb) <docker@docker.com>
sub   rsa4096 2017-02-22 [S]
Use the following command to set up the stable repository. To add the nightly or test repository, add the word nightly or test (or both) after the word stable in the commands below. Learn about nightly and test channels.

Note: The lsb_release -cs sub-command below returns the name of your Ubuntu distribution, such as xenial. Sometimes, in a distribution like Linux Mint, you might need to change $(lsb_release -cs) to your parent Ubuntu distribution. For example, if you are using Linux Mint Tessa, you could use bionic. Docker does not offer any guarantees on untested and unsupported Ubuntu distributions.
```

#### docker repository 에서 image 검색

```sh
$ sudo docker search tomcat
NAME                          DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
tomcat                        Apache Tomcat is an open source implementati…   2446                [OK]                
tomee                         Apache TomEE is an all-Apache Java EE certif…   66                  [OK]                
dordoka/tomcat                Ubuntu 14.04, Oracle JDK 8 and Tomcat 8 base…   53                                      [OK]
bitnami/tomcat                Bitnami Tomcat Docker Image                     28                                      [OK]
```
- NAME 에 tomcat 앞에 이름이 없는 것이 공식 image

#### docker image 내려받기 (tag를 명시하지 않으면 자동으로 latest 버전을 내려 받는다)

```sh
$ sudo docker pull tomcat
```

#### docker image 삭제하기

```sh
$ sudo docker rmi tomcat
```

#### docker manifest 확인 (layer 체크)

```sh
$ sudo docker inspect tomcat
```

#### docker 실행 (-d 옵션은 백그라운드에서 실행)

```sh
$ sudo docker run [image name] [-d]
$ sudo docker run -t -p [ext_ip]:[int_ip] tomcat
```

#### docker 컨테이너 조회 (-a 옵션: 실행/비실행 모두 조회, -q: id만 조회)

```sh 
$ sudo docker ps [-a] [-q]
```

#### docker 컨테이너 모두 stop 및 삭제

```sh
$ sudo docker stop $(docker ps -a -q) // docker 컨테이너 모두 정지
$ sudo docker rm $(docker ps -a -q) // docker 컨테이너 모두 삭제
```

#### docker 컨테이너의 shell 접속 (it 옵션을 주어야 터미널 접속 가능)
- __i__: interacive 모드
- __t__: tty 모드

```sh 
$ sudo docker exec -it [container_id] /bin/bash
```

#### docker container start

```sh
$ sudo docker start $(docker ps -a -q) // docker 컨테이너 모두 정지
```