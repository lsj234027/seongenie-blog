---
title: New Post!
date: 2019-07-07 14:07:47
category: js
---

### 1. shell highlight

```sh
$ npm run post
```

---

### 2. js highlight

```js{3}
import React from 'react'

const TEMPLATE = 'gatsby-starter-bee'

class Foo extends React.Component {
  handleClick = val => {
    if (val === 'bar') {
      return 1
    } else if (val !== 'zoo') {
      return 2
    }
    console.log(`clicked`)
    return 3
  }

  render() {
    return <div>Welcome, Gatsby, ${TEMPLATE}</div>
  }
}
```
