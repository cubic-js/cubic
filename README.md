[![blitz.js Authentication Server](/banner.png)](https://github.com/nexus-devs)

## 

<br> 

**Simple JWT auth server used for [blitz.js](https://github.com/nexus-devs/blitz.js).**<br><br>

## Usage
1. Generate an RSA key pair and put it in /config/certs (You can also use the existing ones for development)
2. Make sure you're running an instance of mongodb and redis
3. Hook the node into your [blitz.js](https://github.com/nexus-devs/blitz.js) setup
<br>
<br>

**GET /register**:
- Use this to create new users. Server will return:
```
    user_key: <user_key>
    user_secret: <user_secret>
```
You can then use these credentials in the following steps.

<br>

**POST /token**:
- Accepts Credentials in the above format and returns access-and refresh tokens:
```
{
    access_token: <JWT>
    refresh_token: <token>
}
```
<br>

- To get a new access token after the 1h expiration POST this:
```
{
    refresh_token: <token>
}
```
which will return a new `access_token`
<br>
<br>

## License
[MIT](/LICENSE.md)
