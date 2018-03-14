[![blitz.js](https://i.imgur.com/lotIdMo.png)](https://github.com/nexus-devs)

##  

[![npm](https://img.shields.io/npm/v/blitz-js.svg)](https://npmjs.org/blitz-js)
![Node version](http://img.shields.io/badge/node-+8.10.LTS-brightgreen.svg)
![bitHound](https://img.shields.io/bithound/dependencies/github/nexus-devs/blitz-js.svg)


<br>

Blitz-js is a modular full-stack framework for real-time applications that puts
the developer first. Be it frontend development in ES7+,
hot-module-replacement for your view, or component-based API endpoints to keep
your backend tidy - blitz-js gives you all of that out of the box with
**no tedious setups**. It just works.

<br>

## Features
Blitz-js comes with everything needed to create a full-size
web application for modern standards:
- Vue.js as UI rendering engine
- Webpack for optimal dev & prod bundling
- Full OAuth2 integration
- Pub/Sub model for real-time data
- Rate limits and caching on a per endpoint-component basis
- Automatically exposed API endpoints to HTTP and WebSockets
- Decoupled API servers from CPU intensive endpoints for efficient scaling with
  docker

We keep blitz-js fairly opinionated, because it allows us to
focus on one solution and make its usage as convenient and effective as possible.
However, the fully modular nature of the framework allows to easily modify
existing nodes, so you'll never be locked in with what *we* think is best.

<br>

## Getting started in 5 minutes
Before you get started, make sure you have [redis](https://redis.io/) and
[mongodb](https://www.mongodb.com/download-center?jmp=nav#community) running on their default ports.<br>
If you have to install these first, I apologize for lying about the "5 minutes"
in the title. If not, you'll have a blast!

### Install
Select your project folder and run the following:
```sh
npm init
npm install blitz-js
```

### Entrypoint
Next we'll create **index.js** as our entrypoint to the server
```js
// index.js
const Blitz = require('blitz-js')
const blitz = new Blitz()

// Load auth, view and api nodes needed for a basic setup
blitz.bootstrap()
```

### Ready to go
Now all we need to do is run
```sh
node index.js
```
And blitz-js will automatically create some default API endpoints and views
that you can learn the basics from. <br>
Check out `localhost:3000` to have a look at the view server.

If everything went right, **you'll find an interactive tutorial on that server**,
asking you to hack the site. You'll have to work on the site's own code to
fulfill some **objectives** and proceed. There'll be plenty of tips though, so
it shouldn't be too hard. In fact, there's always a full solution available
to each objective at all times.

<br>

## Getting ready for production
For advanced usage that you'll need in production, have a look at [blitz-js-loader](https://github.com/nexus-devs/blitz-js-loader). It lets you
load every single node individually, pass custom configs and create your own
group of blitz-js nodes.

We cannot stress enough how important this is for production, especially if
you aim to containerize your application, since every node can be
split up into a separate process this way.

<br>

## License
[MIT](/LICENSE)
