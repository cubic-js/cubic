[![blitz.js](/banner.png)](https://github.com/nexus-devs)
<p align="center">Horizontal scaling made easy by giving you control over each individual component.</p>

##  

<br>

## Example

```javascript
require("blitz-js")()

const Auth = require("blitz-js-auth")
blitz.use(new Auth()) // Authentication server which generates user tokens

const API = require("blitz-js-api")
blitz.use(new API()) // Public api node which will get data from the resource node below

const Core = require("blitz-js-core")
blitz.use(new Core()) // Resource node which authenticates as root and sends available endpoints to api node
```
Now visit `localhost:3010/foo` to get your `bar`.

<br>

## Hooks
Hooks allow you to execute functions right before a certain node launches. Within the function, you'll have access to `blitz.config[node]` with all the options you've set in `blitz.use()`.

### Example
```javascript
require("blitz-js")()

let options = { ferret: "tobi" }
let hookFn = () => console.log(blitz.config.api.ferret)

let API = require("blitz-js-api")
blitz.hook(API, hookFn)
blitz.use(new API(options)) // logs "tobi"
```
The stack of hook functions will be saved in `blitz.nodes[node].hooks`.

<br>

## Configuration
```javascript
require("blitz-js")({ key: value })
```

| Key           | Value         | Description   |
|:------------- |:------------- |:------------- |
| environment   | development   | / | 
| environment   | production    | / | 
| logLevel      | info          | Default log level. Logs limited information about the node status. |
| logLevel      | error         | Error Log Level. Helpful for automated tests. |
| logLevel      | verbose       | Verbose log level. Includes Request Timestamps, Socket Connections, Config events, etc. |
| logLevel      | silly         | Silly log level. Includes internal information on which routes are being bound, diagnostics and lifecycle details. |

Configuration settings will be accessible via `blitz.config.local`. For configuration of individual nodes, check out their repositories below.

<br>

## Available Nodes
| RepositoryLink          | npmPackage       | Description   |
|:------------- |:------------- |:------------- |
| [blitz.js-api](https://github.com/nexus-devs/blitz.js-api) | [blitz-js-api](https://www.npmjs.com/package/blitz-js-api) | RESTful API with WebSocket support which authorizes and distributes requests to the resource node. |
| [blitz.js-core](https://github.com/nexus-devs/blitz.js-core) | [blitz-js-core](https://www.npmjs.com/package/blitz-js-core) | Resource Server for simple endpoint implementation to the API node. |
| [blitz.js-auth](https://github.com/nexus-devs/blitz.js-auth) | [blitz-js-auth](https://www.npmjs.com/package/blitz-js-auth) | Authentication Server for creating users and providing JSON Web Tokens to grant authorization on the API node.
<br>

## API Packages
We also provide client packages to connect to any blitz.js API, so you needn't worry about accessibility for developers! <br>


>**npm**: [blitz-js-query](https://www.npmjs.com/package/blitz-js-query)<br>
>**pip**: [blitz-js-query](https://pypi.python.org/pypi?:action=display&name=blitz-js-query)
<br>

## Further Documentation
Coming soon

<br>

## License
[MIT](/LICENSE)
