import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'
// import babel from 'rollup-plugin-babel'
// import babelrc from '../.babelrc.json'
import hypothetical from 'rollup-plugin-hypothetical'

export default {
  input: './src/browser/index.js',
  output: {
    format: 'cjs',
    file: './browser.js'
  },
  plugins: [
    hypothetical({
      allowFallthrough: true,
      files: {
        './node_modules/ws/index.js': 'export default {}'
      }
    }),
    nodeResolve(),
    commonjs(),
    // babel(babelrc),
    cleanup()
  ]
}
