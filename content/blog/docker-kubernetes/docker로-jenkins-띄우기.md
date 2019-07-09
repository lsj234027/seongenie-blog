---
title: 03. docker로 jenkins 띄우기
date: 2019-07-08 14:07:73
category: docker-kubernetes
---

1. jenkins 이미지를 검색한다.
```sh
$ sudo docker search jenkins
NAME            DESCRIPTION                               STARS    OFFICIAL   AUTOMATED
jenkins         Official Jenkins Docker image             4327     [OK]                
jenkins/jenkins The leading open source automation server 1563                                
```

2. docker 공식 publishing 이미지인 jenkins 를 내려 받는다.
```sh
$ sudo docker pull jenkins
```

3. 내려받은 jenkins image 를 실행한다. (8080 으로 실행)
```sh
$ sudo docker run -itp 8080:8080 jenkins
```

4. http://localhost:8080 를 열어 jenkins에 접속되는지 확인한다.

<div>
    <h2> Dockerfile 에 정의할 수 있는 인스트럭션 </h2>
    <table>
        <thead>
            <tr>
                <th>instruction</th>
                <th>description</th>
                <th>example</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>FROM</strong></td>
                <td>기본이 될 이미지 이름을 지정</td>
                <td><code>FROM ubuntu:14.04</code></td>
            </tr>
            <tr>
                <td><strong>RUN</strong></td>
                <td>기본이 될 이미지 이름을 지정</td>
                <td><code>FROM ubuntu:14.04</code></td>
            </tr>
            <tr>
                <td><strong>COPY</strong></td>
                <td>기본이 될 이미지 이름을 지정</td>
                <td>FROM ubuntu:14.04</td>
            </tr>
            <tr>
                <td><strong>ADD</strong></td>
                <td>기본이 될 이미지 이름을 지정</td>
                <td>FROM ubuntu:14.04</td>
            </tr>
            <tr>
                <td><strong>CMD</strong></td>
                <td>기본이 될 이미지 이름을 지정</td>
                <td>FROM ubuntu:14.04</td>
            </tr>
        </tbody>
    </table>
</div>
