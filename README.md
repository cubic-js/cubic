# nexus-auth
**Simple JWT auth server used for [nexus-stats](https://github.com/Kaptard/nexus-stats). Feel free to use anything you need if you plan on making your own server.**<br><br>
[![Supported by Warframe Community Developers](https://github.com/Warframe-Community-Developers/banner/blob/master/banner.png)](https://github.com/Warframe-Community-Developers)
- - - -

## Usage
1. Generate an RSA key pair called private.pem & public.pem and put it in /config/certs
2. Make sure you're running an instance of mongodb on :27017
3. `npm install && npm start`
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

**POST /auth**: 
- Accepts Credentials like this:
```
{
    user_key: <user_key>
    user_secret: <user_secret>
}
``` 
and returns access-and refresh tokens:
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
