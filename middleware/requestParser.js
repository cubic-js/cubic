/**
 * Converts standard URL string into JSON object usable by core nodes
 */
class RequestParser {
  /**
   * Convert URL into JSON
   */
  parse (req, res, next) {
    // Proper request format?
    if (typeof req.url === 'string' || req.url instanceof String) {
      this.process(req, res, next)
    }

    // Improper request format
    else {
      next('Invalid Request Format. Please provide a URL string.')
    }
  }

  /**
   * Actual Parsing Logic
   */
  process (req, res, next) {
    let url = req.url

    // Clean up
    url = url.split('%20').join(' ')
    url = url.replace('https://', '')
    url = url.replace('http://', '')

    // Slice sub-categories
    url = url.split('/')

    // Remove already-assigned data
    url.pop()
    url.splice(0, 3)

    // Assign Resource Path
    req.resource = url
    next()
  }
}

module.exports = new RequestParser()
