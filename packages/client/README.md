[![cubic-client](https://i.imgur.com/EBnxQiy.png)](/packages/client)

<p align="center">Connection packages to connect to <a href='/packages/api'>Cubic</a> API nodes. Choose your target platform from the available branches.</p>

##

[![npm](https://img.shields.io/npm/v/cubic-client.svg)](https://npmjs.org/cubic-client)
[![build](https://ci.nexus-stats.com/api/badges/cubic-js/cubic/status.svg)](https://ci.nexus-stats.com/cubic-js/cubic)
[![dependencies](https://david-dm.org/cubic-js/cubic-client.svg)](https://david-dm.org/cubic-js/cubic-client)

<br>
<br>


## Installation
`npm install cubic-client`

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
| user_key | `null` | User key obtained via Auth-Node registration |
| user_secret | `null` | User secret obtained via Auth-Node 

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

## License
[MIT](/LICENSE.md)
