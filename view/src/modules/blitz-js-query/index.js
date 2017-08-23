import Connection from "./lib/connection.js"

class Blitz {

  /**
   * Merge default options with client options
   */
  constructor(options) {
    this.connecting = null
    this.options = Object.assign({

      // Resource Config
      api_url: "http://localhost:3010/",
      auth_url: "http://localhost:3030/",

      // Connection Config
      namespace: '/',

      // Authorization Config
      user_key: null,
      user_secret: null,
      ignore_limiter: false
    }, options)

    // Remove "/" from url's
    let api = this.options.api_url
    let auth = this.options.auth_url
    this.options.api_url = api[api.length - 1] === "/" ? api.slice(0, -1) : api
    this.options.auth_url = auth[auth.length - 1] === "/" ? auth.slice(0, -1) : auth

    this.connect()
  }


  /**
   * Connect by getting tokens and setting up clients
   */
  async connect() {
    this.connection = new Connection(this.options)
    this.connecting = this.connection.connect()
    await this.connecting
    this.connecting = null
  }


  /**
   * Subscribe to certain endpoints
   */
  async subscribe(endpoint) {
    await this.connecting
    this.emit("subscribe", endpoint)
  }


  /**
   * Event listening for socket.io
   */
  async on(ev, func) {
    await this.connecting
    this.connection.client.on(ev, func)
  }


  /**
   * Expose Socket client emit
   */
  async emit(ev, data) {
    await this.connecting
    this.connection.client.emit(ev, data)
  }


  /**
   * RESTful methods for manual interaction
   */
  async query(verb, query) {
    await this.connecting
    return this.connection.request(verb, query)
  }

  get(query) {
    return this.query("GET", query)
  }

  post(url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query("POST", query)
  }

  put(url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query("PUT", query)
  }

  patch(url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query("PATCH", query)
  }

  delete(url, body) {
    let query = {
      url: url,
      body: body
    }
    return this.query("DELETE", query)
  }
}

export default Blitz
