
[![blitz.js API](https://i.imgur.com/iZZkPod.png)](https://github.com/nexus-devs)

##

<p align='center'>Request processing node for <a href='https://github.com/nexus-devs/blitz-js'>blitz-js</a> endpoint components.</p>

<br>
<br>

## Usage
```js
const Blitz = require('blitz-js')
const Core = require('blitz-js-core')
const blitz = new Blitz()

blitz.use(new Core(options))
```
This will create a core node that connects to the API node on `localhost:3003`
and listen to any incoming requests. We'll being using this for our application
logic.

<br>

## How does it work?
Whenever a user requests a URL on the API node, that request is actually being
processed at the core node.

The API checks every core node for an endpoint
component that matches the desired URL and the first core node to respond
affirmatively gets to process the request and return a response.

[![model](https://i.imgur.com/E4Lnnqx.png)](https://i.imgur.com/E4Lnnqx.png)

Should no core node find a matching endpoint, we return a '404, not found'.
Should all core nodes fail to respond to the initial check within one
second, we respond with a '503, All nodes currently busy'.

<br>

## Endpoint components
To respond to requests, blitz-js-core looks for endpoint components in the
**/api** folder in the current working directory. These components are
automatically routed based on folder and file names.

An endpoint saved as `/api/test/foo.js` would automatically be exposed as
`localhost:3003/test/foo`. Custom URLs can still be specified through the
endpoint schema.

Endpoint components usually extend the default endpoint class which contains
information on rate limiting, caching and more:

```js
const Endpoint = blitz.nodes.core.Endpoint

class Foo extends Endpoint {
  /**
   * Set custom schema information (optional)
   */
  constructor(api, db, url) {
    super(api, db, url)
    this.schema = options
  }

  /**
   * Main method which will be called on a request
   */
  async main(req, res) {
    res.send('bar')   // Respond with a simple 'bar'
    this.cache('bar') // And cache the response for follow-up requests
  }
}

module.exports = Foo
```

<br>

## Endpoint Parent Properties
The `Endpoint` class that we're extending in each endpoint comes with a few
utilities that can be used within the class like this:

#### Caching
```js
this.cache(data, exp, url)
```
Allows storing a value in redis, which will be sent as a response to requests
within the given timeframe. The response is looked up on the api node directly,
*not* on the core node.

| Param        | Default       | Description   |
|:------------- |:------------- |:------------- |
| data | none | Value to store in the cache. |
| exp | default value in blitz-js-api | (optional) Duration for which the cached value should persist. |
| url | `this.url` | (optional) URL to store the cached value on.

#### Publish
```js
this.publish(data, url)
```
Publishes data in [blitz-js's Pub/Sub model](https://github.com/nexus-devs/blitz-js/#pub/sub-model).
This is important for real-time data, as every subscribed client will receive
the published changes immediately.

| Param        | Default       | Description   |
|:------------- |:------------- |:------------- |
| data | none | Data to publish to subscribed clients. |
| url | `this.url` | (optional) URL to publish the data on. Useful when a POST endpoint changes the data of another GET endpoint. |

#### Endpoint Schema
```js
this.schema
```
Provides basic information about the endpoint, including rate limiting, custom
URL and more. See [options](#options) for all options.

#### Database client
```js
this.db
```
Every endpoint gets passed the database client that is connected to the database
specified in [options](#options).

#### API client
```js
this.api
```
The [blitz-js-query](https://github.com/nexus-devs/blitz-js-query) instance used
to connect to our target API. Can be useful if we need to make requests on
endpoints hosted by other core nodes. Under the hood, it's also used for
`this.publish` and `this.cache`.

<br>

## Options

#### Constructor
```js
blitz.use(new Core(options))
```

| Option        | Default       | Description   |
|:------------- |:------------- |:------------- |
| endpointPath | `process.cwd()/api` | Folder to read API endpoints from. |
| endpointParent | internal | Parent class that API endpoints will extend. |
| baseUrl | none | Path to prepend to each route found in endpoints folder. |
| publicPath   | `process.cwd()/assets`   | Folder containing publically accessible files. |
| apiUrl | `'http://localhost:3003'` | API node to connect to |
| authUrl | `'http://localhost:3030'` | Auth node to authenticate at |
| userKey | none | User key to authenticate with. These are registered and assigned automatically in dev mode. In production, you need to register them yourself. (see [blitz-js-auth](https://github.com/nexus-devs/blitz-js-auth) for reference) |
| userSecret | none | User secret to authenticate with. Handled the same way as above. |
| mongoUrl | `'mongodb://localhost'` | Mongodb connection string. |
| mongoDb | `'blitz-js-core'` | Database to select by default. |
| redisUrl | `'redis://localhost'`` | Redis connection string. |

#### Endpoint Schema
```js
class Endpoint extends EndpointParent {
  constructor() {
    this.schema = options
  }
}
```
| Option        | Default       | Description   |
|:------------- |:------------- |:------------- |
| method | `'GET'` | RESTful method to listen for.
| scope | `''` | Authorization scope required to use this endpoint. E.g. `'read_contacts'`
| description | none | (optional) Description for the current endpoint. Useful for automatic API documentation.
| query | `[]` | (optional) Array specifying rules for query params (see object format below)
| limit | see below | Object describing rate limit specifications. See keys and default values below

#### Endpoint Query Object
```js
this.schema.query = [{
  name: 'time',
  default: () => moment().endOf('day').valueOf() // Returns value at time of execution rather than construction
}]
```

| Option        | Default       | Description   |
|:------------- |:------------- |:------------- |
| name | none | Name of the given query key. For example in `/route?foo=value` the query key name is `'foo'`
| default | none | (optional) Default value for query key. Can be raw value or a function returning a value. If a default value is given, its data type is automatically enforced on user input. E.g. you can't provide numbers if the default value is a string.
| required | `false` | (optional) Whether the query key is required on user input. Will return a 400 error if no matching key is given.
| description | `''` | (optional) Description for the given key. Useful for automated API documentation.

#### Endpoint Rate Limits
```js
this.schema.limit = {
  interval: 5000,
  maxInInterval: 20
}
```

| Option        | Default       | Description   |
|:------------- |:------------- |:------------- |
| disable | `false` | (optional) Whether rate limits should be enforced on this endpoint. The default rate limit is applied on all endpoints and we recommend keeping it that way. If some API clients like your service workers need to bypass rate limits, you can add the `ignore_rate_limit` scope to their user account.
| interval | `5000` | Interval in ms for the token bucket to refill.
| maxInInterval | `20` | Maximum number of requests within a single interval.

<br>

## License
[MIT](/LICENSE.md)