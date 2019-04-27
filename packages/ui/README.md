[![cubic-ui](https://i.imgur.com/y38cUhF.png)](/packages/ui)

<p align='center'>UI rendering node and server for <a href='https://github.com/cubic-js/cubic'>Cubic</a>.</p>

##  

[![npm](https://img.shields.io/npm/v/cubic-ui.svg)](https://npmjs.org/cubic-ui)
[![build](https://ci.nexus-stats.com/api/badges/cubic-js/cubic/status.svg)](https://ci.nexus-stats.com/cubic-js/cubic)
[![dependencies](https://david-dm.org/cubic-js/cubic-ui.svg)](https://david-dm.org/cubic-js/cubic-ui)

<br>
<br>


## Scope authentication
UI endpoints can be protected in the same way as regular API endpoints, via the `this.schema.scope` option, they also behave the same way (see [cubic-api](/packages/api)).

#### Creating a login system
Creating a login system is as simple as writing a `POST` form which targets the [cubic-auth](/packages/auth) `/authenticate` endpoint with `cookie_set` set.
Cubic-auth then sets a cookie which contains the user's access and refresh token. If you want to logout, simply remove the cookie and refresh the page.

#### Dealing with scoped api endpoints
Sometimes, you want to access a scoped API endpoint on a non-scoped UI endpoint. The default behaviour, when a non-authorized user connects, is to terminate the entire page like an entire endpoint would.  
However, you still want to sometimes show the ui, with the scoped API content removed or edited. If you want to do something like that, add try/catch blocks in your `asyncData` hooks:
```js
try {
    cubic.get('/scoped_api_endpoint')
} catch (err) {
    // Show alternative content
}
```
