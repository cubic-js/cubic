
[![cubic-api](https://i.imgur.com/wWHFif0.png)](https://github.com/nexus-devs/cubic-api)

##

<p align='center'>Load balancer, cache and more for <a href='https://github.com/nexus-devs/cubic'>Cubic</a>. Built on Express.js
and Socket.io.</p>

<br>
<br>


## Usage
```js
const Cubic = require('cubic')
const Api = require('cubic-api')
const cubic = new Cubic()

cubic.use(new Api(options))
```
This will open a web server on `localhost:3003` which serves data from connected
cubic-core nodes. No further setup needed - the [core nodes](https://github.com/nexus-devs/cubic-core) are where our application logic goes.

<br>


## How does it work?
At its core, cubic-api is a load balancer for connected cubic-core nodes.
What makes it special is that it allows the use of custom connection adapters
that create a common `req` and `res` object from any connection type. (HTTP &
Socket.io by default)

This way our middleware functions and routed endpoints will work for *all*
connection types, with no need to adjust them individually.

<br>

For further understanding, here's a simple model showing the way a request
will go until we get a response:

[![model](https://i.imgur.com/JjUKPuk.png)](https://i.imgur.com/JjUKPuk.png)

This is only one half of the way a request goes. To see what happens once the request
is sent to a connected core node, check out [cubic-core](https://github.com/nexus-devs/cubic-core).

<br>

## Writing custom middleware
If you need to access the `req`, `res` objects before they're sent to the
core node, you can simply add your custom function to the async middleware
stack. It behaves much like express middleware, but takes advantage of ES7
async.

### Example
```js
cubic.nodes.api.use('/ferret', async (req, res) => {

  // Return image of angry ferret if the user isn't tobi.
  if (req.user.uid !== 'tobi') {
    let image = await getSomeAngryFerretPictures()

    // we MUST return a truthy value to stop the middleware chain from executing
    return res.send(image)
  }

  // If nothing is returned, we'll assume the user is tobi and proceed with the
  // next middleware function
})
```
We recommend reading through the full docs at the [async-middleware-stack](https://github.com/Kaptard/async-middleware-stack)
repo if you need further information.

### Native Middleware
If necessary, you can still add native connection middleware which runs before
our own.
```js
cubic.nodes.api.server.http.app.use((req, res, next) => {}) // Native Express Middleware
cubic.nodes.api.server.sockets.io.use((socket, next) => {}) // Native Socket.io Middleware
```

<br>

## Making requests as a client
We heavily recommend using [cubic-client](https://github.com/nexus-devs/cubic-client)
since it takes care of authorization, rate limits and potential downtimes automatically.
This package is also used to connect core nodes to API nodes, so we most likely
won't be slacking with its maintenance.

<br>

## Options

```js
cubic.use(new Api(options))
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

## License
[MIT](/LICENSE.md)
