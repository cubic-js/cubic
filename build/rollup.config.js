import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'

export default {
  entry: './src/index.js',
  dest: './lib/index.js',
  // Module settings
  format: 'cjs',
  moduleName: 'AsyncDelayQueue',

  plugins: [
    babel(babelrc()),
    nodeResolve({ jsnext: true, main: true }),
    commonjs(),
    cleanup()
  ]
}
