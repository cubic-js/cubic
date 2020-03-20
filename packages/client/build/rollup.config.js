import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import hypothetical from 'rollup-plugin-hypothetical'
import { terser } from 'rollup-plugin-terser'

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
    terser()
  ]
}
