const Endpoint = require(blitz.config[blitz.id].endpointParent)

/**
 * Contains multi-purpose functions for child-methods and provides default values
 */
 class Index extends Endpoint {
     constructor(api, db, url) {
         super(api, db, url)
         this.schema.description = "Primary Landing Page"
         this.schema.url = "/"
     }

    async main() {
        return this.render("app.vue", {
            node: blitz.id
        })
     }
 }

module.exports = Index
