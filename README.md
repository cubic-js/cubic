
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
This will create a core node that connects to the API node on localhost:3003
and listen to any incoming requests. We'll being using this for our application
logic.

| Option        | Default       | Description   |
|:------------- |:------------- |:------------- |
| publicPath   | `process.cwd()/assets`   | Folder containing publically accessible files. |
| endpointPath | `process.cwd()/api` | Folder to read API endpoints from. |
| endpointParent | internal | Parent class that API endpoints will extend. |
| baseUrl | none | Path to prepend to each route found in endpoints folder. |
| apiUrl | `'http://localhost:3003'` | API node to connect to |
| authUrl | `'http://localhost:3030'` | Auth node to authenticate at |
| userKey | none | User key to authenticate with. These are registered and assigned automatically in dev mode. In production, you need to register them yourself. (see [blitz-js-auth](https://github.com/nexus-devs/blitz-js-auth) for reference) |
| userSecret | none | User secret to authenticate with. Handled the same way as above. |
| mongoUrl | `'mongodb://localhost'` | Mongodb connection string. |
| mongoDb | `'blitz-js-core'` | Database to select by default. |
| redisUrl | `'redis://localhost' | Redis connection string. |

<br>

## License
[MIT](/LICENSE.md)