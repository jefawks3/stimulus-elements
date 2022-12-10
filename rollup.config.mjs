import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"
import packageJson from "./package.json" assert { type: "json" }

const banner = `/*\nStimulus Elements ${packageJson.version}\n */`

export default [
  {
    input: "src/index.js",
    output: [
      {
        name: "Stimulus Elements",
        file: "dist/stimulus-elements.umd.js",
        format: "umd",
        banner
      },
      {
        file: "dist/stimulus-elements.js",
        format: "es",
        banner
      },
    ],
    context: "window",
    plugins: [
      nodeResolve(),
      typescript()
    ]
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/stimulus-elements.min.js",
      format: "es",
      banner,
      sourcemap: true
    },
    context: "window",
    plugins: [
      nodeResolve(),
      typescript(),
      terser({
        mangle: true,
        compress: true,
        sourceMap: {
          filename: "stimulus-elements.min.js",
          url: "stimulus-elements.min.js.map"
        }
      })
    ]
  }
]
