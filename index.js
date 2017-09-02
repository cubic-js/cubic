/**
 * Dependencies
 */
require('events').EventEmitter.prototype._maxListeners = 100
const local = require('./config/local.js')
const auth = require('./auth.js')
const CircularJSON = require('circular-json')
const _ = require('lodash')
const fork = require('child_process').fork
const epoch = new Date()

/**
 * Blitz.js module builder
 */
class Blitz {
  /**
   * Set global blitz config system
   */
  constructor(options) {
    global.blitz = this
    blitz.config = {}
    blitz.nodes = {}
    blitz.log = new(require('./config/logger.js'))()

    let config = {
      local: local,
      provided: options
    }

    this.setConfig('local', config)
  }

  /**
   * Attach module config to global blitz object
   */
  setConfig(id, config) {
    let local = _.cloneDeep(config.local) // merge seems to mutate original
    let merged = _.merge(local, config.provided)
    blitz.config[id] = {}

    // Add each key to global blitz object
    for (var property in merged) {
      blitz.config[id][property] = merged[property]
    }
  }

  /**
   * Send a message to all workers of a node and resolve with response
   */
  send(workers, type, body, listener) {
    return new Promise(resolve => {
      let responses = 0
      workers.forEach(worker => {
        worker.send({
          type,
          body
        })
        worker.once('message', msg => {
          if (msg.type === listener) {
            responses++
            if (responses === workers.length) resolve(msg.body)
          }
        })
        setTimeout(() => {
          if (responses !== workers.length) {
            this.send(workers, type, body, listener).then(resolve)
          }
        }, 500)
      })
    })
  }

  /**
   * Hook functions to be executed before specific node is clustered while making node config available to the Hook
   */
  hook(node, fn) {
    let id = typeof node === 'string' ? node : node.name.toLowerCase()

    // Create global node obj if not existing
    if (!blitz.nodes[id]) {
      blitz.nodes[id] = {}
    }

    // Create hook stack to be executed before cluster()
    if (!blitz.nodes[id].hooks) {
      blitz.nodes[id].hooks = []
    }

    blitz.nodes[id].hooks.push(fn)
  }

  /**
   * Execute hooks for specific node
   */
  runHooks(id) {
    if (blitz.nodes[id].hooks) {
      blitz.nodes[id].hooks.forEach(async hook => {
        await hook()
        blitz.log.monitor(`Hooked ${hook.name} on ${id}`, true, `${new Date() - epoch}ms`)
      })
    }
  }

  /**
   * Let blitz handle framework modules
   */
  async use(node) {
    let nid = node.config.provided ? node.config.provided.id : undefined
    let id = nid || node.constructor.name.toLowerCase()

    // Property already set? Merge them.
    if (blitz.nodes[id]) {
      blitz.nodes[id] = _.merge(blitz.nodes[id], node)
    }

    // Property not assigned before
    else {
      blitz.nodes[id] = {}
    }

    // If master module -> have it spawn its slaves ()
    if (node.config.local.master) {
      this.setConfig(id, node.config)
      node.init()
    }

    // Slave -> manage RSA keys and credentials, then launch
    else {
      await auth.verify(node.constructor.name.toLowerCase(), id, node.config)
      this.setConfig(id, node.config)
      this.runHooks(id)
      this.cluster(node, id)

      // Log when ready
      await this.pingAll(blitz.nodes[id].workers)
      blitz.log.monitor(`Loaded ${id} node`, true, `${new Date() - epoch}ms`)
    }
  }

  /**
   * Create workers from node file
   */
  async cluster(node, id) {
    let file = node.filename
    let cores = 1 // blitz.config[id].cores

    // Fork Workers
    blitz.nodes[id].workers = []
    for (let i = 0; i < cores; i++) {
      // Add to node's worker list to be accessible globally
      blitz.nodes[id].workers.push(fork(file, {
        env: {
          isWorker: true
        }
      }))
      let worker = blitz.nodes[id].workers[i]
      worker.ping = () => {
        return this.ping(worker)
      }

      // We don't want pseudo circular references in the worker
      let subBlitz = _.cloneDeep(blitz)
      subBlitz.id = id
      subBlitz.nodes = {}
      worker.send({
        type: 'setGlobal',
        body: this.serialize(subBlitz)
      })

      // Make Worker methods accessible from global blitz
      this.exposeMethods(node, id)

      // Restart worker on exit
      blitz.nodes[id].workers[i].on('death', () => {
        blitz.nodes[id].workers.push(fork(file))
      })
    }
  }

  /**
   * Ping method to check for listeners on process. Returns time elapsed.
   * This may be replacable with `this.send()`
   */
  ping(worker) {
    return new Promise(resolve => {
      let timestart = new Date()
      let resolved = false

      // Send ping
      worker.send({
        type: 'ping',
        body: {}
      })

      // Listen to response
      worker.once('message', msg => {
        if (msg.type === 'pong') {
          resolve(new Date() - timestart)
          resolved = true
        }
      })

      // Retry if no response
      setTimeout(() => {
        if (!resolved) {
          this.ping(worker).then(() => {
            resolve(new Date() - timestart)
            resolved = true
          })
        }
      }, 500)
    })
  }

  /**
   * Wrapper which pings all nodes opposed to just one. Does not include
   * timeouts.
   */
  pingAll(workers) {
    return this.send(workers, 'ping', {}, 'pong')
  }

  /**
   * Make Worker methods accessible from global blitz
   */
  exposeMethods(node, id) {
    for (let method of Object.getOwnPropertyNames(Object.getPrototypeOf(node))) {
      let _this = this
      blitz.nodes[id][method] = function() {
        return _this.setMethodInterface(id, method, arguments)
      }
    }
  }

  /**
   * Helper function which calls functions on worker
   */
  setMethodInterface(id, method, args) {
    return new Promise(resolve => {
      blitz.nodes[id].workers.forEach(async worker => {
        await worker.ping()

        // Call function with given args
        worker.send({
          type: 'call',
          body: {
            method: method,
            args: this.serialize(args)
          }
        })

        // Listen to response
        worker.on('message', msg => {
          if (msg.type === 'return' && msg.body.method === method) {
            resolve(msg.body.value)
          }
        })
      })
    })
  }

  /**
   * Serialize global blitz object so it can be sent via stdout to workers
   */
  serialize(obj) {
    return CircularJSON.stringify(obj, (key, value) => {
      return (typeof value === 'function') ? value.toString() : value
    })
  }
}

/**
 * Pass options to constructor on require
 */
module.exports = (options) => {
  new Blitz(options)
}
