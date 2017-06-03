[![Nexus Stats API Package](/banner.png)](https://github.com/nexus-devs)

<p align="center">Nodejs package to connect to <a href="https://github.com/nexus-devs/blitz.js">blitz.js</a> API nodes.</p>

##

<br>

## Installation
`npm install blitz-js-query`

<br>

## Usage
```js
const Blitz = require("blitz-js-query")
const blitz = new Blitz()

blitz.get("/foo").then(res => console.log(res.body)) // bar
```

<br>

## Configuration
```javascript
const Blitz = require("blitz-js-query")
const blitz = new Blitz({key: value})
```

| Key           | Default         | Description   |
|:------------- |:------------- |:------------- |
| api_url | "http://localhost:3010/" | URL of blitz.js API-Node to connect to | 
| auth_url | "http://localhost:3030/" | URL of blitz.js Auth-Node to authenticate with | 
| use_socket | true | Whether or not to use Socket.io as standard request engine. Setting to false uses http. Subscriptions will use Socket.io regardless. |
| namespace | "/" | Socket.io namespace to connect to |
| user_key | null | User key obtained via Auth-Node registration |
| user_secret | null | User secret obtained via Auth-Node |
| ignore_limiter | false | Whether or not to disable the default rate limit adaptions. Disabling this only makes sense if you connect as a user who won't face rate limits. If you disable it anyway, expect all your requests to get blocked. |

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

### Socket.io

```js
blitz.subscribe(endpoint)
```
>Subscribe to updates on a specific endpoint. Updates can be listened to via `blitz.on(endpoint, fn)`.

| Argument | Description | Default |
|:------------- |:------------- |:------------- |
| endpoint | URL to listen for updates on, without domain. e.g. `/foo` | None |

<br>

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
