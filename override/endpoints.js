const fs = require('fs')
const path = require('path')

class EndpointController {
  /**
   * Override original endpoint controller with custom loading functions to
   * automatically generate fitting endpoint when none is provided
   */
  override (controller) {
    controller.generateEndpointSchema = this.overrideEndpointSchema(controller)
    controller.getViewTree = this.overrideEndpointTree(controller)
  }

  /**
   * Get endpoint schema from src/pages folder instead of endpoint folder
   */
  overrideEndpointSchema (controller) {
    const override = function () {
      this.endpoints = []
      this.getEndpointTree(this.config.endpointPath)
      this.getViewTree(`${blitz.config.view.sitesPath}`)
    }
    return override.bind(controller)
  }

  /**
   * Change which file types are detected and change endpoint attributes
   */
  overrideEndpointTree (controller) {
    const override = function (filepath) {
      let stats = fs.lstatSync(filepath)
      let endpoint = {}

      // Folder
      if (stats.isDirectory()) {
        fs.readdirSync(filepath).map(child => {
          return this.getViewTree(filepath + '/' + child)
        })
      }

      // File -> Set endpoint config
      else {
        let Endpoint = blitz.nodes.view.core.Endpoint
        let endpoint = new Endpoint().schema
        let sitesSubDir = blitz.config.view.sitesPath.replace(blitz.config.view.sourcePath, '')
        endpoint.view = filepath.replace(`${blitz.config.view.sourcePath}`, '')
        endpoint.route = endpoint.view.replace(sitesSubDir, '').replace('.vue', '').replace('index', '')
        endpoint.file = blitz.config.view.core.endpointParent

        // Only add to list of endpoints if no explicit endpoint with same
        // route already exists
        if (!this.endpoints.find(e => e.route === endpoint.route)) {
          this.endpoints.push(endpoint)
        }
      }
    }
    return override.bind(controller)
  }

  /**
   * Quick method starting a rebuild of existing endpoints
   */
  rebuild (controller) {
    return controller.generateEndpointSchema()
  }
}

module.exports = new EndpointController()