
[![blitz-js-api](https://i.imgur.com/rtmexse.png)](https://github.com/nexus-devs)

##

<p align='center'>Load balancer, cache and more for <a href='https://github.com/nexus-devs/blitz-js'>blitz-js</a>. Built on Express.js
and Socket.io.</p>

<br>
<br>


## Usage
```js
const Blitz = require('blitz-js')
const Api = require('blitz-js-api')
const blitz = new Blitz()

blitz.use(new Api(options))
```
| Option        | Default       | Description   |
|:------------- |:------------- |:------------- |
| port   | `3003`   | Port to listen on for requests. |
| redisUrl | `'redis://localhost'` | Base URL for redis connection. |
| cacheDb | `1` | Redis database used to store cache data. |
| cacheExp | `10` | Time in seconds until cached data expires when no explicit duration is specified. |
| requestTimeout | `1000` | Time to wait in ms when sending request to core node before assuming timeout. |
| routes | `'/connections/entry/routes.js'` | Entry point for HTTP requests via express. (No need to modify unless you're building something very exotic.) |
| events | `'/connections/entry/events.js'` | Entry point for WS requests via Socket.io. |

<br>

## How does it work?
At its core, the blitz-js-api server is a load balancer that creates a common
interface for request objects of every protocol that is specified in an adapter.
Currently this includes HTTP and Websockets (Socket.io).

Combined with express-like async middleware, this allows for modular
features such as:
- Automatic caching
- Automatic auth token verification
- Dynamic rate limits
- Custom request loggers
- And anything else that you can think of

All without having to think about which protocol we're working with.
For further understanding, here's a simple model showing the way a request
will go until we get a response:

[![mode](https://i.imgur.com/9tH6ctn.png)](https://i.imgur.com/9tH6ctn.png)

This is only half the way a request goes. To see what happens once the request
is sent to a connected core node, check out [blitz-js-core](https://github.com/nexus-dev/blitz-js-core).

<br>

## RESTful requests

<br>

## Pub/Sub model
Blitz-js's Pub/Sub model is one of the most important features for applications
relying on real-time data. Instead of polling for new data every x seconds,
we simply listen to an API resource and get notified on changes.

Right now this **only works for Socket.io**, but there's an [open issue to integrate
it with HTTP webhooks](https://github.com/nexus-devs/blitz-js-api/issues/19).

### Publishing new data on blitz-js-core
```js
// inside a blitz-js-core endpoint
// ...
async main(req, res) {
  // Publish new data on the current endpoint
  this.publish(`My data has updated! [${new Date}]`)

  // Or publish data on another URL
  this.publish('Somebody else\'s data has updated!', '/some/other/url')
}
// ...
```

### Subscribing with blitz-js-query
```js
const Client = require('blitz-js-query')
const client = new Client({ /** options **/ })

// Subscribe
client.subscribe('/api/resource/to/listen/on', data => {
  console.log(data) // Will log the endpoint data on every update
})

// Unsubscribe
client.unsubscribe('/api/resource/to/listen/on')
```

### Subscribing with Socket.io
```js
const socket = require('socket.io-client')('http://target-host.tld')

// Subscribe
socket.emit('subscribe', '/api/resource/to/listen/on')
socket.on('/api/resource/to/listen/on', data => {
  console.log(data)
})

// Unsubscribe
socket.emit('unsubscribe', '/api/resource/to/listen/on')
socket.off('/api/resource/to/listen/on')
```

<br>

## Writing Middleware
The server also provides a simple express-like middleware stack to be executed before each request gets passed to another node, but **after** native express/socket middleware.<br>

### Example
```javascript
let api = require('path/to/api/node.js')

api.use((req, res, next) => {
    if (req.user.uid === 'foo') {
        res.send('bar') // Same as res.status(200).send('bar')
    } else {
        next(new Error('I\'m a teapot')) // Sends error and stops further actions
    }
})
```
Note that socket requests get modified to behave just like an express request, thus enabling the use of middleware functions fitting all connection types.

### Native Middleware
If necessary, you can still target native connection middleware which runs before the one explained above.
```javascript
let api = require('path/to/api/node.js')

api.http.app.use((req, res, next) => {}) // Native Express Middleware
api.sockets.io.use((socket, next) => {}) // Native Socket.io Middleware
```
Keep in mind that native socket middleware won't allow you to respond to requests with callback functions as of v1.7.3 or lower.

<br>

## License
[MIT](/LICENSE.md)
