[![cubic-auth](https://i.imgur.com/da8ckiV.png)](https://github.com/nexus-devs/cubic-auth)

##

<p align="center">Simple OAuth2 server used for <a href="https://github.com/nexus-devs/cubic">Cubic</a>. Built on <a href="https://github.com/nexus-devs/cubic-api">cubic-api</a> and <a href="https://github.com/nexus-devs/cubic-core">cubic-core</a>.</p>

<br>
<br>

## Usage
```js
const Cubic = require('cubic')
const Auth = require('cubic-auth')
const cubic = new Cubic()

cubic.use(new Auth(options))
```
| Option        | Default       | Description   |
|:------------- |:------------- |:------------- |
| exp   | `'1h'`   | Access token expiration date since being issued. |
| alg   | `'RS256'`  | JWT signature algorithm |
| certPrivate | none | String of private RSA key used for JWT signature. (This is set automatically in dev mode) |
| certPublic | none | String of public RSA key used to verify JWT signature. (Set automatically in dev mode) |
| certPass | none | Optional secret to decrypt the provided RSA keys |
| maxLogsPerUser | `50` | Number of access logs for each user |
| api | `<object>` | Configure internal cubic-api node. See [override options](#override-config) below. |
| core | `<object>` | Configure internal cubic-core node. |

<br>

## How does it work?
**Imagine this:** You're a happy little web-app that wants to get data from a Web API. However,
that API endpoint is only open to authorized users. The API will only let us in if we show
it a document explaining who we are, which is signed by a trusted authority.<br>

In our case, the auth server is that trusted authority. To get the document, we just
need to provide the username and passphrase used when registering our account and
we'll get the signed document (the access token) in return.<br>

Since the access token is signed by the trusted authority, the API believes what the access
token tells about the user and sees if they have the required permission to access the desired
API endpoint.

[![model](https://i.imgur.com/WKjqjoT.png)](https://i.imgur.com/WKjqjoT.png)
You usually don't have to bother with these concepts when building your application,
but it might help your understanding of the framework in general. If you wanna
know even more details, here's a quick rundown of the main endpoints that are
exposed on the auth API:

<br>

## /authenticate
**POST /authenticate**
>Body:
>```
>{
>  user_key: <username>,
>  user_secret: <password>
>}
>```
>Response:
>```
>{
>  access_token: <access_token>,
>  refresh_token: <refresh_token>
>}
>```

Used to verify a user that is stored in the auth database. If the user/password
matches, this returns an **access_token** and **refresh_token**.

The **access_token** is a *short-lived* (1h by default) **JSON Webtoken (JWT)**
containing all important user data (name, permissions, etc). It is highly
recommended to look at how they work at [jwt.io](https://jwt.io/).

cubic-auth uses the `RSA256` signature algorithm to generate a signature from
the plaintext payload with an RSA private key.
This signature ensures that the data provided in the payload hasn't been modified
or forged by an attacker. By signing the token with RSA keys, we can
later use the public key on cubic-api nodes to verify the signature - without
exposing our private key in case of a security breach.


<br>

## /refresh
**POST /refresh**
>Body:
>```
>{
>  refresh_token: <refresh_token>
>}
>```
>Response:
>```
>{
>  access_token: <access_token>
>}
>```

Used to generate new access tokens from the provided refresh token.

The **refresh_token** is the token used to ask for new access tokens once they
expired. It's *long-lived* (i.e. doesn't expire unless reset for security
reasons), and looks like `user_key` + `256bit string` to ensure an unguessable
token which is unique to the user.<br>

The reason access tokens are short-lived is to reduce the time an attacker gets
in the case of access tokens being leaked. There's no way to revoke the
permissions granted by stateless JWTs, but it's easy to revoke a single refresh
token.


<br>

## /register
**GET /register**
>Body:
>```
>{
>  user_key: <username>,
>  user_secret: <password>
>}
>```
> Response:
>```
>{
>  user_id: <uid>
>}
>```

Used to save new users to the database. Passwords are hashed with [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) at 8
salt rounds.
Please make sure you're using HTTPS, otherwise someone could intercept the plaintext password.

<br>

## Getting the access tokens to the target API
Now that we have the access token, the question still remains how we get it on
the API node and how we can read the data from cubic-core endpoints.

### On the client
For **http** requests, just put the access token in the auth header.<br>
With node's 'requests' library, the options object would look something like this:
```js
{
  header: {
    authorization: 'bearer <access_token>'
  }
}
```

For **Socket.io** we have to send the token with the intial handshake.<br>
Just put this as the options object when connecting:
```js
{
  query: 'bearer=<access_token>'
}
```
Note that these things are taken care of automatically with the [cubic-client](https://github.com/nexus-devs/cubic-client)
package. The examples merely serve for clarification, but you shouldn't actually
have to use them manually.

### On the API node
On the API node we have a default middleware function that verifies the
socket.io handshake as well as the authorization header on every http request,
by verifying the token signautre with the provided RSA public key.

Should the verification fail, a 401 error message will be returned.<br>
Should no token be provided, we'll just pass the default user with no special
permissions.

If the verification succeeds or no token is provided, the payload
(or default user) is attached to `req.user`. This is the same `req` object
that we later have access to on a cubic-core endpoint. With the verification
performed beforehand, we can be certain that whatever data we get in `req.user`
will be valid.

The scope specified in `req.user.scp` will also be automatically compared to
`this.schema.scope` inside an endpoint. Should it not match, a 401 error will
be returned.

<br>


## Override config
Since the cubic-auth server is completely based on a regular cubic setup,
we can configure the cubic-api and cubic-core options individually.
Below are the overrides used by default.

#### cubic-api
| Api Option        | Override       | Description   |
|:------------- |:------------- |:------------- |
| port   | `3030`   | Port to listen on for requests. |
| cacheDb| `3`  | Redis database used to store cache data. |
| group     | `'auth'` | Group which sub-node is attached to. |

#### cubic-core
| Core Option        | Override       | Description   |
|:------------- |:------------- |:------------- |
| mongoUrl | `'mongodb://localhost/'`   | Base URL for mongodb connection. |
| mongoDb  | `'cubic-auth'`  | Mongodb database to use in endpoints by default |
| apiUrl   | `'http://localhost:3030'` | API to serve requests on. |
| authUrl  | `'http://localhost:3030'` | Auth server to authenticate on. (same as API) |
| group       | `'auth'` | Group which sub-node is attached to. |


<br>

## License
[MIT](/LICENSE.md)
