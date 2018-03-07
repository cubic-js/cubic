
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
This will open a web server on localhost:3003 which serves data from connected
blitz-js-core nodes.

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
At its core, blitz-js-api is a load balancer for connected blitz-js-core nodes.
What makes it special is that it allows the use of custom connection adapters
that create a common `req` and `res` object from any connection type. (HTTP &
Socket.io by default)

This way our middleware functions and routed endpoints will work for *all*
connection types, with no need to adjust them individually.

Combined with express-like async middleware, this allows for modular features such as:
- Automatic caching
- Automatic auth token verification
- Dynamic rate limits
- Custom request loggers
- And anything else that you can think of

All without having to think about which protocol we're working with.
For further understanding, here's a simple model showing the way a request
will go until we get a response:

[![model](https://i.imgur.com/JjUKPuk.png)](https://i.imgur.com/JjUKPuk.png)

This is only one half of the way a request goes. To see what happens once the request
is sent to a connected core node, check out [blitz-js-core](https://github.com/nexus-dev/blitz-js-core).

<br>

## Writing custom middleware
If you need to access the `req`, `res` objects before they're sent to the
core node, you can simply add your custom function to the async middleware
stack. It behaves much like express middleware, but takes advantage of ES7
async.

### Example
```js
blitz.nodes.api.use('/ferret', async (req, res) => {

  // Return image of angry ferret if the user isn't tobi.
  if (req.user.uid !== 'tobi') {
    let image = await getSomeAngryFerretPictures()
    return res.send(image) // we MUST return a truthy value to stop the mw stack.
  }

  // Proceed to the secret ferret endpoint if the user actually is tobi.
})
```
We recommend reading through the full docs at the [async-middleware-stack](https://github.com/Kaptard/async-middleware-stack)
repo if you need further information.

### Native Middleware
If necessary, you can still add native connection middleware which runs before
our own.
```js
let api = require('path/to/api/node.js')

blitz.nodes.api.server.http.app.use((req, res, next) => {}) // Native Express Middleware
blitz.nodes.api.server.sockets.io.use((socket, next) => {}) // Native Socket.io Middleware
```

<br>

## Pub/Sub model
Blitz-js's Pub/Sub model is one of the most important features for applications
relying on real-time data. Instead of polling for new data every x seconds,
we simply listen to an API resource and get notified on changes.

[![pub/sub model](https://i.imgur.com/LvDzCYx.png)](https://i.imgur.com/LvDzCYx.png)

Right now this **only works for Socket.io**, but there's an [open issue to integrate
it with HTTP webhooks](https://github.com/nexus-devs/blitz-js-api/issues/19).

### Publishing new data on blitz-js-core
```js
// inside a blitz-js-core endpoint
async main(req, res) {

  // Publish new data on the current endpoint
  this.publish(`My data has updated! [${new Date}]`)

  // Or publish data on another URL
  this.publish('Somebody else\'s data has updated!', '/some/other/url')
}
```

### Subscribing with blitz-js-query
```js
const Client = require('blitz-js-query')
const client = new Client(options)

// Subscribe
client.subscribe('/api/resource/to/listen/on', data => {
  console.log(data) // Will log the endpoint data on every update
})

// Unsubscribe
client.unsubscribe('/api/resource/to/listen/on')
```

<br>

## Making requests as a client
While usually we recommend [blitz-js-query](https://github.com/nexus-devs/blitz-js-query)
for client connections, you might find yourself in a situation where you can
only use Socket.io directly, so here's a quick rundown how it works with blitz-js.

#### GET
```javascript
socket.emit("GET", "/foo", data => {
  // Do something with response data
})
```

#### POST, PUT, etc
```javascript
socket.emit("POST", {
  url: "/bar",
  body: "Your POST data"
}, data => {
  // Do something with response data
})
```

#### Subscribing
```js
socket.emit('subscribe', '/api/resource/to/listen/on')
socket.on('/api/resource/to/listen/on', data => {
  // Do something with newly updated data
})
```

#### Unsubscribing
```js
socket.emit('unsubscribe', '/api/resource/to/listen/on')
socket.off('/api/resource/to/listen/on')
```

## License
[MIT](/LICENSE.md)
