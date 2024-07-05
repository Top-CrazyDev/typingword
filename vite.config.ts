import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from "@vitejs/plugin-vue-jsx";
import {resolve} from 'path'
import {visualizer} from "rollup-plugin-visualizer";
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {getLastCommit} from "git-last-commit";

function pathResolve(dir:string) {
  return resolve(__dirname, ".", dir)
}

const lifecycle = process.env.npm_lifecycle_event;


// https://vitejs.dev/config/
export default defineConfig(async () => {
  const latestCommitHash = await new Promise<string>((resolve) => {
    return getLastCommit((err, commit) => (err ? 'unknown' : resolve(commit.shortHash)))
  })
  return {
    plugins: [
      vue({
        reactivityTransform: true
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      vueJsx(),
      lifecycle === 'report' ?
        visualizer({
          gzipSize: true,
          brotliSize: true,
          emitFile: false,
          filename: "report.html", //分析图生成的文件名
          open: true //如果存在本地服务端口，将在打包后自动展示
        }) : null,
    ],
    define: {
      LATEST_COMMIT_HASH: JSON.stringify(latestCommitHash + (process.env.NODE_ENV === 'production' ? '' : ' (dev)')),
    },
    //默认是'',导致只能在一级域名下使用。
    base: './',
    resolve: {
      alias: {
        "@": pathResolve("src"),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    server: {
      port: 3000,
      open: false,
      host: '0.0.0.0',
      fs: {
        strict: false,
      },
      proxy: {
        '/baidu': 'https://api.fanyi.baidu.com/api/trans/vip/translate'
      }
    }
  }
})
