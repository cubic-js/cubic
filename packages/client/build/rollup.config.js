import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'

export default {
  input: './src/browser/index.js',
  output: {
    format: 'cjs',
    file: './browser.js'
  },
  plugins: [
    babel(babelrc()),
    nodeResolve({ jsnext: true, main: true }),
    commonjs(),
    cleanup()
  ]
}
