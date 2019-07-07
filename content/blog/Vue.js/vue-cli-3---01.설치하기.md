---
title: Vue CLI 3 - 01. 설치하기
date: 2019-07-07 16:07:84
category: Vue.js
---

> [Vue CLI 공식 문서](https://cli.vuejs.org/)

- Vue CLI는 Vuejs를 **CommandLine Interface** 로 쉽게 생성할 수 있게 해준다.

- CLI 2 와는 디렉토리 구조가 조금 달라졌다. **build, config** 등이 사라졌고, webpack v4를 사용한다. 웹팩 세부 설정이 필요하다면, **vue.config.js** 를 루트 폴더에 생성하고 설정 내용을 작성하면 된다.

###1. npm 을 이용하여 vue-cli를 global 옵션을 주고 설치한다.

```sh
npm install -g @vue/cli
```

---

### 2. 설치된 vue cli 를 이용하여 새 프로젝트를 생성한다.

1. 먼저 `vue create [프로젝트명]` 커맨드를 입력하여 vue 프로젝트를 생성한다.

```sh
vue create my-project
```

2. **(1)** 명령어 수행시 preset 을 설정하는 화면이 나온다. `default` 를 선택하면 babel 과 eslint 옵션이 자동으로 설치되며, `Manually select features` 를 선택하 Vuex, Router 등 다양한 플러그인을 선택할 수 있다. (default 를 선택하더라도 추후 `vue add 플러그인` 명령으로 추가할 수 있다.)

```sh
Vue CLI v3.8.2
┌───────────────────────────┐
│  Update available: 3.9.2  │
└───────────────────────────┘
? Please pick a preset: (Use arrow keys)
> default (babel, eslint)
  Manually select features
```

3. `Manually select features` 선택 후, 플러그인 선택 화면

```
Vue CLI v3.8.2
┌───────────────────────────┐
│  Update available: 3.9.2  │
└───────────────────────────┘
? Please pick a preset: Manually select features
? Check the features needed for your project: (Press <space> to select, <a> to toggle all, <i> to invert selection)
>(*) Babel
 ( ) TypeScript
 ( ) Progressive Web App (PWA) Support
 ( ) Router
 ( ) Vuex
 ( ) CSS Pre-processors
 (*) Linter / Formatter
 ( ) Unit Testing
 ( ) E2E Testing
```

4. 다음 각종 설정들을 모두 선택하면, 프로젝트가 생성된다. 생성된 프로젝트로 위치 진입 후, `npm run serve` 를 입력하면 서버가 실행된다.

```sh
🎉  Successfully created project test.
👉  Get started with the following commands:
 $ cd my-project
 $ npm run serve
```
