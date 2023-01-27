import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import metablock from 'rollup-plugin-userscript-metablock'
import json from '@rollup/plugin-json'

import fs from 'fs'
import pkg from './package.json' assert { type: 'json' }

fs.mkdir('dist/', { recursive: true }, () => null)

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.user.js',
    format: 'iife',
    name: 'rollupUserScript',
    banner: () => '\n/*\n' + fs.readFileSync('./LICENSE', 'utf8') + '*/\n\n/* globals React, ReactDOM */',
    sourcemap: true,
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
  plugins: [
    json(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      ENVIRONMENT: JSON.stringify('production'),
      preventAssignment: true,
    }),
    nodeResolve({ extensions: ['.js', '.ts', '.tsx'] }),
    commonjs({
      include: ['node_modules/**'],
      exclude: ['node_modules/process-es6/**'],
    }),
    babel({ babelHelpers: 'bundled' }),
    metablock({
      file: './meta.json',
      override: {
        version: pkg.version,
        description: pkg.description,
        homepage: pkg.homepage,
        author: pkg.author,
        license: pkg.license,
      },
    }),
  ],
  external: (id) => /^react(-dom)?$/.test(id),
}
