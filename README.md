[![cubic-client](https://i.imgur.com/EBnxQiy.png)](https://github.com/nexus-devs/cubic-client)

<p align="center">Connection packages to connect to <a href='https://github.com/nexus-devs/cubic-api'>Cubic</a> API nodes. Choose your target platform from the available branches.</p>

##

[![npm](https://img.shields.io/npm/v/cubic-client.svg)](https://npmjs.org/cubic-client)
[![build](https://ci.nexus-stats.com/api/badges/cubic-js/cubic-client/status.svg)](https://ci.nexus-stats.com/cubic-js/cubic-client)
[![dependencies](https://david-dm.org/cubic-js/cubic-client.svg)](https://david-dm.org/cubic-js/cubic-client)

<br>
<br>


## Installation
`npm install cubic-client`

<br>

## Other Supported Platforms

| Platform           | Install        | Description   |
|:------------- |:------------- |:------------- |
| [python](https://github.com/nexus-devs/cubic-client/tree/python) | pip | For usage in Python. Might have to enable HTTP explicitly since Socket.io isn't that well maintained on python.

<br>

## Usage
```js
const Client = require('cubic-client')
const client = new Client()

cubic.get('/foo').then(res => console.log(res.body)) // bar
```

<br>

## Configuration
```javascript
const Client = require('cubic-client')
const client = new Client({key: value})
```

| Key           | Default         | Description   |
|:------------- |:------------- |:------------- |
| api_url | `'http://localhost:3003/'` | URL of cubic API-Node to connect to |
| auth_url | `'http://localhost:3030/'` | URL of cubic Auth-Node to authenticate with |
| namespace | `'/'` | Socket.io namespace to connect to |
| user_key | `null` | User key obtained via Auth-Node registration |
| user_secret | `null` | User secret obtained via Auth-Node |
| ignore_limiter | `false` | Whether or not to disable the default rate limit adaptions. Disabling this only makes sense if you connect as a user who won't face rate limits. If you disable it anyway, expect all your requests to get blocked. |

<br>
<br>

## API

### RESTful methods
```js
client.get(url)
```
>Sends a GET request to the API-Node

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| url | URL to request, without domain. e.g. `/foo`. | None |

<br>

```js
client.post(url, body)
```
>Sends a POST request to the API-Node

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| url | URL to request, without domain. e.g. `/foo`. | None |
| body | Data to send to endpoint. Can be any data type. | None |

<br>

```js
client.put(url, body)
```
>Sends a PUT request to the API-Node

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| url | URL to request, without domain. e.g. `/foo`. | None |
| body | Data to send to endpoint. Can be any data type. | None |

<br>

```js
client.patch(url, body)
```
>Sends a PATCH request to the API-Node

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| url | URL to request, without domain. e.g. `/foo`. | None |
| body | Data to send to endpoint. Can be any data type. | None |

<br>

```js
client.delete(url, body)
```
>Sends a DELETE request to the API-Node

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| url | URL to request, without domain. e.g. `/foo`. | None |
| body | Data to send to endpoint. Can be any data type. | None |

<br>

### Pub/Sub

```js
client.subscribe(endpoint, fn)
```
>Subscribe to updates on a specific endpoint.

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| endpoint | URL to listen for updates on, without domain. e.g. `'/foo'` | None |
| fn | Function to run when updates are received. Takes the new data as argument. | None |

<br>

### Authentication
```js
client.login(user, secret)
```
>Re-authorizes as a specific user at runtime. Usually users should be logged in
through the constructor options.

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| user | User id, equal to `user_key` when registering. | None |
| secret | User password, equal to `user_secret` when registering. | None |

<br>

```js
client.setRefreshToken(token)
```
>Manually set the refresh token. This way user credentials needn't be exposed.

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| token | `refresh_token` to use. | None |

<br>

```js
client.getRefreshToken()
```
>Retrieve current refresh token. Will await any existing authentication
process. Useful if the initial login can be done through user/pass but
the refresh token needs to be stored for subsequent logins.

<br>

```js
client.setAccessToken(token)
```
>Manually set the access token. This will expire on the next refresh.

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| token | `access_token` to use. | None |

<br>

```js
client.getRefreshToken()
```
>Retrieve current access token. Will await any existing authentication process.

<br>

### Socket.io

```js
client.on(ev, fn)
```
>Listens to specific Socket.io event, then runs the given function with the received data

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| ev | Event name. | None |
| fn | Function to execute on event trigger | None |

<br>

```js
client.emit(ev, data)
```
>Emits event via Socket.io client to server

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| ev | Event name. | None |
| data | Data to transmit. Can be any data type. | None |

<br>


## License
[MIT](/LICENSE.md)
