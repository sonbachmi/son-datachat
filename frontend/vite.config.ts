import {fileURLToPath, URL} from 'url'
import {resolve} from 'path'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = fileURLToPath(new URL('./', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: [
            {find: '@', replacement: resolve(__dirname, 'src')},
        ],
    },
    server: {
        allowedHosts: [
            'datachat.sonnguyen.online'
        ]
    }
})
