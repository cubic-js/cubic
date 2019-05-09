[![cubic](https://i.imgur.com/VbaKTrc.png)](https://github.com/nexus-devs)

##  

[![npm](https://img.shields.io/npm/v/cubic.svg)](https://npmjs.org/cubic)
[![Node version](http://img.shields.io/badge/node-+8.10.LTS-brightgreen.svg)](https://nodejs.org/en/)
[![dependencies](https://david-dm.org/cubic-js/cubic.svg)](https://david-dm.org/cubic-js/cubic)
[![build](https://ci.nexus-stats.com/api/badges/cubic-js/cubic/status.svg)](https://ci.nexus-stats.com/cubic-js/cubic)

<br>

Cubic is a simple wrapper that integrates node.js frameworks into one platform that's
easy to scale in docker or kubernetes.

Even though we're already using this framework in production for [NexusHub](https://github.com/nexus-devs/NexusHub),
this project is still very much in development and lacks documentation in some places.

<br>

## Features
Cubic comes with everything needed to create a full-size web application for
modern standards:
- Automatically routed API endpoints to HTTP and WebSockets
- Webpack for optimal dev & prod bundling
- Full OAuth2 integration
- Pub/Sub model for real-time data
- Rate limits and caching on a per-endpoint basis
- Clear endpoint schema for automated unit tests

We provide all of these features regardless of which http/ws server you choose to use under the hood.

<br>

## Usage
To install cubic to your project:
```sh
npm init
npm install cubic cubic-api cubic-auth cubic-ui cubic-client cubic-defaults
```
This looks like a lot of things, but that's because you don't actually need more
than `cubic` and `cubic-api` for a minimal API server. Everything else only extends
the base functionality for the sake of showing you a fully working web-app.


### Entrypoint
Next we'll create **index.js** as our entrypoint to the server
```js
// index.js
const Cubic = require('cubic')
const cubic = new Cubic()

// Load auth, view and api nodes needed for a basic setup
cubic.bootstrap()
```

### Ready to go
Now all we need to do is run
```sh
node index.js
```
And Cubic will automatically create some default API endpoints and views
that you can learn the basics from. <br>
You'll now find your web-app on `localhost:3000` 🎉

<br>

## License
[MIT](/LICENSE)
