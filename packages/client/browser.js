"use strict";var t={};function e(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function s(t,e){return t(e={exports:{}},e.exports),e.exports}var n=s((function(t,e){Object.defineProperty(e,"__esModule",{value:!0});var s=function(){function t(){this._queue=[],this._pending=!1}return t.prototype.isLocked=function(){return this._pending},t.prototype.acquire=function(){var t=this,e=new Promise((function(e){return t._queue.push(e)}));return this._pending||this._dispatchNext(),e},t.prototype.runExclusive=function(t){return this.acquire().then((function(e){var s;try{s=t()}catch(t){throw e(),t}return Promise.resolve(s).then((function(t){return e(),t}),(function(t){throw e(),t}))}))},t.prototype._dispatchNext=function(){this._queue.length>0?(this._pending=!0,this._queue.shift()(this._dispatchNext.bind(this))):this._pending=!1},t}();e.default=s}));e(n);var i=s((function(t,e){Object.defineProperty(e,"__esModule",{value:!0}),e.Mutex=n.default}));e(i);i.Mutex;const r=i.Mutex,o=1;var c=class{constructor(t,e){this.url=t,this.options=e,this.timeout=3e4,this.req={delay:this.options.requestDelay||500,counter:0},this.reconnect={delay:this.options.reconnectDelay||500,counter:0},this.lastHeartbeat=new Date,this.subscriptions=[],this.requests=[],this.retryQueue=[],this.requestIds=1,this.mutex=new r,setInterval(async()=>{new Date-this.lastHeartbeat>this.timeout&&this.isConnected()&&this.connection.close(1001,"Heartbeat took too long.")},this.timeout),this._processRetryQueue()}async connect(){const t=await this.mutex.acquire();await this._createConnection(),t()}awaitConnection(){return new Promise(t=>{this.isConnected()&&t();const e=setInterval(()=>{this.isConnected()&&(clearInterval(e),t())},100)})}isConnected(){return this.connection&&this.connection.readyState===o}async request(t,e,s=!1){return await this.awaitConnection(),new Promise(n=>{const i=this.requestIds++,r={action:t,id:i};"string"==typeof e?r.url=e:(r.url=e.url,r.body=e.body),this.requests.push({id:i,resolve:n,verb:t,query:e,retry:s});try{this.connection.send(JSON.stringify(r))}catch(t){this.requests.pop(),this.connection.emit("error",t)}})}async reloadConnection(){await this.awaitConnection(),await this.connection.close(1001,"Reloading connection.")}async retry(t){this.retryQueue.push({verb:t.verb,query:t.query,id:t.retry||t.id,customDelay:t.customDelay||null})}async _processRetryQueue(){const t=this.req.counter,e=this.retryQueue.shift();let s=!1;e&&(e.customDelay?(s=e.customDelay,delete e.customDelay,this.retryQueue.unshift(e)):(this.request(e.verb,e.query,e.id),this.req.counter++)),setTimeout(()=>this._processRetryQueue(),s||this.req.delay*Math.pow(2,t))}async _reconnect(){const t=await this.mutex.acquire();this.connection&&this.connection.readyState<=o||(await new Promise(t=>setTimeout(()=>t(),this.reconnect.delay*Math.pow(2,this.reconnect.counter))),this.reconnect.counter++,await this._createConnection()),t()}async _resumeConnection(){for(const t of this.requests)this.retry(t);for(const t of this.subscriptions)this.connection.send(JSON.stringify({action:"SUBSCRIBE",room:t.room}))}async _createConnection(){const e=this.apiAccessToken?{headers:{authorization:`bearer ${this.apiAccessToken}`}}:{},s=new t(this.url,e);s.onopen=()=>this._resumeConnection(),s.onerror=t=>console.log(`WebSocket Error: ${t.message}`),s.onclose=t=>{1e3!==t.code&&this._reconnect()},s.onmessage=t=>this._onMessage(t.data),this.connection=s}async _onMessage(t){if("string"==typeof(t=JSON.parse(t))&&t.startsWith("primus::ping::"))this.lastHeartbeat=new Date,this.connection.send(JSON.stringify(t.replace("ping","pong"))),this.reconnect.counter=0;else if("RES"===t.action&&t.id)this._processResponse(t);else if("PUBLISH"===t.action)for(const e of this.subscriptions)e.room===t.room&&e.fn(t.data)}async _processResponse(t){const e=this.requests.find(e=>e.id===t.id);if(!e)return;const s=await this._errCheck(t,e.verb,e.query);if(!s){let s=t.body&&t.body.reason?parseInt(t.body.reason.replace(/[^0-9]+/g,"")):void 0;return e.customDelay=isNaN(s)?void 0:s,void this.retry(e)}this.req.counter=0,e.resolve(s);const n=e.retry?this.requests.find(t=>t.id===e.retry):null;n&&n.resolve(s);this.requests=this.requests.filter(e.retry?t=>t.id!==e.retry&&t.retry!==e.retry:t=>t.id!==e.id&&t.retry!==e.id)}async _errCheck(t,e,s){if(t.body.error)throw t;return t.body}};class a extends Error{constructor({statusCode:t,body:e},s){const n=e.error?e.error+`(${e.reason})`:e;super(`Cubic-client encountered an error while requesting ${s.url||s}: ${t} - ${n}`),this.statusCode=t,this.reason=e.reason,this.error=e.error}}var u=a;var h=class extends c{async setAccessToken(t){this.apiAccessToken=t}async _errCheck(t,e,s){if(t.body&&t.body.reason&&t.body.reason.includes("jwt expired"))return{EXPIRED:!0,verb:e,query:s};if(!t.statusCode&&t.includes("timed out"))return!1;if(429===t.statusCode)return!1;if(503===t.statusCode)return!1;if(parseInt(t.statusCode.toString().charAt(0))>3)throw new u(t,s);return t.body}};const l=i.Mutex;var p=class extends c{constructor(t,e){super(t,e),this.authMutex=new l}async authorize(t=this.refresh_token){if(t||this.options.user_key&&this.options.user_secret)return t?this._refreshToken():this._getTokens()}login(t,e){return this.options.user_key=t,this.options.user_secret=e,this._getTokens()}async _getTokens(){const t={user_key:this.options.user_key,user_secret:this.options.user_secret},e=await this.request("POST",{url:"/authenticate",body:t});this.access_token=e.access_token,this.refresh_token=e.refresh_token}async _refreshToken(){const t=await this.authMutex.acquire(),e={refresh_token:this.refresh_token},s=await this.request("POST",{url:"/refresh",body:e});this.access_token=s.access_token,t()}async _errCheck(t,e,s){return t.statusCode>=400&&503!==t.statusCode&&404!==t.statusCode&&429!==t.statusCode?(console.error("Cubic-client encountered an error while authenticating:"),console.error(t.body),console.error("retrying... \n"),!1):t.body}};var y=class{constructor(t){this.options=t,this.options.isBrowser||(this.api=new h(this.options.api_url,this.options),this.auth=new p(this.options.auth_url,{user_key:this.options.user_key,user_secret:this.options.user_secret}))}awaitConnection(){return Promise.all([this.api.awaitConnection(),this.auth.awaitConnection()])}async connect(){await this.auth.connect(),await this.auth.authorize(),await this.api.setAccessToken(this.auth.access_token),await this.api.connect()}async query(t,e){const s=await this.api.request(t,e);return s.EXPIRED?(await this.auth.authorize(),await this.api.setAccessToken(this.auth.access_token),this.query(s.verb,s.query)):s}async subscribe(t,e){await this.api.awaitConnection(),this.api.connection.send(JSON.stringify({action:"SUBSCRIBE",room:t})),this.api.subscriptions.push({room:t,fn:e})}async unsubscribe(t){await this.api.awaitConnection(),this.api.connection.send(JSON.stringify({action:"UNSUBSCRIBE",room:t})),this.api.subscriptions=this.api.subscriptions.filter(e=>e.room!==t)}async login(t,e){await this.awaitConnection(),await this.auth.login(t,e),await this.api.setAccessToken(this.auth.access_token),await this.api.reloadConnection()}async setAccessToken(t){this.auth.access_token=t,await this.api.setAccessToken(this.auth.access_token),await this.api.reloadConnection()}};var d=class{constructor(t){this.options={api_url:"ws://localhost:3003/ws",auth_url:"ws://localhost:3030/ws",user_key:null,user_secret:null,...t};let e=this.options.api_url,s=this.options.auth_url;this.options.api_url="/"===e[e.length-1]?e.slice(0,-1):e,this.options.auth_url="/"===s[s.length-1]?s.slice(0,-1):s,this._createClient()}awaitConnection(){return this.client.awaitConnection()}isConnected(){return this.client.api.isConnected()}subscribe(t,e){return this.client.subscribe(t,e)}unsubscribe(t){return this.client.unsubscribe(t)}query(t,e){return this.client.query(t,e)}get(t){return this.query("GET",t)}post(t,e){return this.query("POST",{url:t,body:e})}put(t,e){return this.query("PUT",{url:t,body:e})}patch(t,e){return this.query("PATCH",{url:t,body:e})}delete(t,e){return this.query("DELETE",{url:t,body:e})}login(t,e){return this.client.login(t,e)}async setRefreshToken(t){this.client.auth.refresh_token=t}async getRefreshToken(){return this.client.auth.refresh_token}setAccessToken(t){return this.client.setAccessToken(t)}async getAccessToken(){return this.client.auth.access_token}_createClient(){this.client=new y(this.options),this.client.connect()}};class _ extends c{async _createConnection(){const t=new WebSocket(this.apiAccessToken?`${this.url}?bearer=${this.apiAccessToken}`:this.url);t.onopen=()=>this._resumeConnection(),t.onerror=t=>console.log(`WebSocket Error: ${t.message}`),t.onclose=t=>{1e3!==t.code&&this._reconnect()},t.onmessage=t=>this._onMessage(t.data),this.connection=t}}class w extends p{}w.prototype._createConnection=_.prototype._createConnection;class f extends h{}f.prototype._createConnection=_.prototype._createConnection;class b extends y{constructor(t){t.isBrowser=!0,super(t),this.api=new f(this.options.api_url,this.options),this.auth=new w(this.options.auth_url,{user_key:this.options.user_key,user_secret:this.options.user_secret})}}module.exports=class extends d{_createClient(){this.client=new b(this.options),this.client.connect()}};
//# sourceMappingURL=browser.js.map
