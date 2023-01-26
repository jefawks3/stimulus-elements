import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import packageJson from "./package.json" assert { type: "json" }

const banner = `/*\nStimulus Elements ${packageJson.version}\n */`

export default [
  {
    input: "src/index.ts",
    external: ['@hotwired/stimulus', "@floating-ui/dom" ],
    output: [
      {
        name: "StimulusElements",
        file: "dist/index.umd.js",
        format: "umd",
        banner,
        globals: {
          '@hotwired/stimulus': 'Stimulus',
          '@floating-ui/dom': 'FloatingUIDom'
        }
      },
      {
        file: "dist/index.js",
        format: "esm",
        banner
      },
    ],
    plugins: [
      replace({
        'process.env.NODE_ENV': process.env.NODE_ENV,
        'process.env.DEBUG': process.env.DEBUG === undefined ? process.env.NODE_ENV === 'development' : process.env.DEBUG === 'true',
        __buildDate__: () => JSON.stringify(new Date()),
        __buildVersion__: packageJson.version,
        preventAssignment: true
      }),
      nodeResolve(),
      typescript(),
      process.env.NODE_ENV === "production" && terser()
    ],
    watch: {
      include: 'src/**'
    }
  }
]
