[![blitz.js Authentication Server](/banner.png)](https://github.com/nexus-devs)

##

<br>

**Simple OAuth2 server used for [blitz-js](https://github.com/nexus-devs/blitz-js).**<br><br>

## Usage
With the [blitz-js](https://github.com/nexus-devs/blitz-js) loader:
```js
const Blitz = require('blitz-js')({
  auth: {
    exp: '1h', // access token expiration date
    alg: 'RS256', // JWT signature algorithm
    certPrivate: fs.readFileSync('path/to/rsa/private.key', 'utf-8'), // Private key for JWT signature
    certPublic: fs.readFileSync('path/to/rsa/public.key', 'utf-8'), // Public key for verifying JWTs
    certPass: 'secret', // Secret used to encrypt the RSA keys (optional)
    maxLogsPerUser: 50, // Number of access logs to store for each user

    core: {}, // See blitz-js-core for options. Just ensure that the api server
              // is the same as the auth server.
    api: {}   // See blitz-js-api for options.
  }
})
```
**Note:** All options are **optional** in dev mode. Everything should work out
of the box. For production, you **must** make sure to provide custom RSA certs.

<br>

## How does it work?
**Imagine this:** You're a happy little web-app that wants to get data from an API. However,
that API endpoint is only open to authorized users. The API will only let us in if we show
it a document of who we are which is signed by a trusted authority.<br>

In our case, the auth server is that trusted authority. To get the document, we just
need to provide the username and passphrase used when registering our account and
we'll get the signed document (the access token) in return.<br>

Since the access token is signed by the trusted authority, the API believes what the access
token tells about the user and sees if they have the required permission to access the desired
API endpoint.

[![model](https://i.imgur.com/w1cZgwz.png)](https://i.imgur.com/w1cZgwz.png)
You usually don't have to bother with these concepts when building your application,
but it might help your understanding of the framework in general, so here's a quick
rundown of the main endpoints that are exposed on the auth API:

<br>

### /authenticate - [/endpoints/authenticate.js](/endpoints/authenticate.js)

Used to verify a user that is stored in the auth database. If the user/password
matches, this returns an **access_token** and **refresh_token**.

The **access_token** is a *short-lived* (1h by default) **JSON Webtoken (JWT)**
containing all important user data (name, permissions, etc). It is highly
recommended to look at how they work at [jwt.io](https://jwt.io/).

Blitz-js-auth uses the `RSA256` signature algorithm to generate a signature from
the plaintext payload with an RSA private key.
This signature ensures that the data provided in the payload hasn't been modified
or forged by an attacker. By signing the token with RSA keys, we can
later use the public key on blitz-js-api nodes to verify the signature - without
exposing our private key in case of a security breach.


<br>

### /refresh - [/endpoints/refresh.js](/endpoints/refresh.js)

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

### /register - [/endpoints/register.js](/endpoints/register.js)

Used to save new users to the database. Passwords are hashed with [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) at 8
salt rounds.

<br>

## Getting the access tokens to the target API
Now that we have the access token, the question still remains how we get it on
the API node and how we can read the data from blitz-js-core endpoints.

### On the client
For **http** requests, just put the access token in the auth header.<br>
With node requests, the options object would look something like this:
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

### On the API node
On the API node we have a default middleware function that verifies the
socket.io handshake as well as the authorization header on every http request,
by verifying the token signautre with the provided RSA public key.

Should the verification fail, a 401 error message will be returned.<br>
Should no token be provided, we'll just pass the default user with no special
permissions.

If the verification succeeds or no token is provided, the payload
(or default user) is attached to `req.user`. This is the same `req` object
that we later have access to on a blitz-js-core endpoint. With the verification
performed beforehand, we can be certain that whatever data we get in `req.user`
will be valid.

The scope specified in `req.user.scp` will also be automatically compared to
`this.schema.scope` inside an endpoint. Should it not match, a 401 error will
be returned.

<br>

## API Specs

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
>On Failure:
>```
>{
>  error: <error type>,
>  reason: <error description>
>}
>```

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
>On Failure:
>```
>{
>  error: <error type>,
>  reason: <error description>
>}
>```

**GET /register**
> Response:
>```
>{
>  user_key: <username>,
>  user_secret: <password>
>}
>```


<br>

## License
[MIT](/LICENSE.md)
