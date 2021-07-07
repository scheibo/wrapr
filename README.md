# `wrapr`

[![npm version](https://img.shields.io/npm/v/wrapr.svg)](https://www.npmjs.com/package/wrapr)

Middleware wrapper logic for asynchronous functions.

```js
const wrapr = require('wrapr');
const fetch = require('node-fetch');

wrapr.retrying(wrapr.throttling(fetch))('https://example.com');

wrapr.retrying(wrapr.throttling(args => fetch(args.init, args.url)))({
  url: 'https://example.com',
  init: {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ foo: 1 }),
  },
});

wrapr.retrying(wrapr.throttling(async url => {
  try {
    return await fetch(url);
  } catch (err) {
    if (err.message.startsWith('HTTP')) {
      throw new wrapr.NonRetryableError(err.message);
    } else {
      throw err;
    }
  }
}))('https://example.com');
```

`wrapr` is distributed under the terms of the [MIT License](LICENSE).
