---
title: Vue CLI 3 - 02. package.json 분석
date: 2019-07-07 17:07:03
category: Vue.js
---

아래는 Vue CLI로 프로젝트 생성 직후의 package.json 파일이다.

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint"
  },
  "dependencies": {
    "core-js": "^2.6.5",
    "vue": "^2.6.10"
  },
  "devDependencies": {
    "@vue/cli-plugin-babel": "^3.9.0",
    "@vue/cli-plugin-eslint": "^3.9.0",
    "@vue/cli-service": "^3.9.0",
    "@vue/eslint-config-airbnb": "^4.0.0",
    "babel-eslint": "^10.0.1",
    "eslint": "^5.16.0",
    "eslint-plugin-vue": "^5.0.0",
    "vue-template-compiler": "^2.6.10"
  },
  "eslintConfig": {
    "root": true,
    "env": {
      "node": true
    },
    "extends": ["plugin:vue/essential", "@vue/airbnb"],
    "rules": {},
    "parserOptions": {
      "parser": "babel-eslint"
    }
  },
  "postcss": {
    "plugins": {
      "autoprefixer": {}
    }
  },
  "browserslist": ["> 1%", "last 2 versions"]
}
```

- `name` 은 프로젝트의 이름이다.
- `version` 은
- `dependencies` 는
- `devDependencies` 는
- `eslintConfig` 는
