[![blitz-js-query](https://i.imgur.com/3vJgroj.png)](https://github.com/nexus-devs)

##

Connection packages to connect to <a href='https://github.com/nexus-devs/blitz-js-api'>blitz.js</a> API nodes. Choose your target platform from the available branches.

<br>


## Installation
`npm install blitz-js-query`

<br>

## Other Supported Platforms

| Platform           | Install        | Description   |
|:------------- |:------------- |:------------- |
| [python](https://github.com/nexus-devs/blitz-js-query/tree/python) | pip | For usage in Python. Might have to enable HTTP explicitly since Socket.io isn't that well maintained on python.

<br>

## Usage
```js
const Blitz = require('blitz-js-query')
const blitz = new Blitz()

blitz.get('/foo').then(res => console.log(res.body)) // bar
```

<br>

## Configuration
```javascript
const Blitz = require('blitz-js-query')
const blitz = new Blitz({key: value})
```

| Key           | Default         | Description   |
|:------------- |:------------- |:------------- |
| api_url | `'http://localhost:3003/'` | URL of blitz.js API-Node to connect to |
| auth_url | `'http://localhost:3030/'` | URL of blitz.js Auth-Node to authenticate with |
| namespace | `'/'` | Socket.io namespace to connect to |
| user_key | `null` | User key obtained via Auth-Node registration |
| user_secret | `null` | User secret obtained via Auth-Node |
| ignore_limiter | `false` | Whether or not to disable the default rate limit adaptions. Disabling this only makes sense if you connect as a user who won't face rate limits. If you disable it anyway, expect all your requests to get blocked. |

<br>
<br>

## API

### RESTful methods
```js
blitz.get(url)
```
>Sends a GET request to the API-Node

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| url | URL to request, without domain. e.g. `/foo`. | None |

<br>

```js
blitz.post(url, body)
```
>Sends a POST request to the API-Node

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| url | URL to request, without domain. e.g. `/foo`. | None |
| body | Data to send to endpoint. Can be any data type. | None |

<br>

```js
blitz.put(url, body)
```
>Sends a PUT request to the API-Node

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| url | URL to request, without domain. e.g. `/foo`. | None |
| body | Data to send to endpoint. Can be any data type. | None |

<br>

```js
blitz.patch(url, body)
```
>Sends a PATCH request to the API-Node

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| url | URL to request, without domain. e.g. `/foo`. | None |
| body | Data to send to endpoint. Can be any data type. | None |

<br>

```js
blitz.delete(url, body)
```
>Sends a DELETE request to the API-Node

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| url | URL to request, without domain. e.g. `/foo`. | None |
| body | Data to send to endpoint. Can be any data type. | None |

<br>

### Pub/Sub

```js
blitz.subscribe(endpoint, fn)
```
>Subscribe to updates on a specific endpoint.

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| endpoint | URL to listen for updates on, without domain. e.g. `'/foo'` | None |
| fn | Function to run when updates are received. Takes the new data as argument. | None |

<br>

### Authentication
```js
blitz.login(user, secret)
```
>Re-authorizes as a specific user at runtime. Usually users should be logged in
through the constructor options.

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| user | User id, equal to `user_key` when registering. | None |
| secret | User password, equal to `user_secret` when registering. | None |

<br>

```js
blitz.setRefreshToken(token)
```
>Manually set the refresh token. This way user credentials needn't be exposed.

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| token | `refresh_token` to use. | None |

<br>

```js
blitz.getRefreshToken()
```
>Retrieve current refresh token. Will await any existing authentication
process. Useful if the initial login can be done through user/pass but
the refresh token needs to be stored for subsequent logins.

<br>

```js
blitz.setAccessToken(token)
```
>Manually set the access token. This will expire on the next refresh.

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| token | `access_token` to use. | None |

<br>

```js
blitz.getRefreshToken()
```
>Retrieve current access token. Will await any existing authentication process.

<br>

### Socket.io

```js
blitz.on(ev, fn)
```
>Listens to specific Socket.io event, then runs the given function with the received data

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| ev | Event name. | None |
| fn | Function to execute on event trigger | None |

<br>

```js
blitz.emit(ev, data)
```
>Emits event via Socket.io client to server

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| ev | Event name. | None |
| data | Data to transmit. Can be any data type. | None |

<br>


## License
[MIT](https://github.com/nexus-devs/npm-blitz-query/blob/master/LICENSE.md)
