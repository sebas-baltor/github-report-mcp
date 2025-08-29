// import { fileURLToPath } from "node:url"
import path from 'path'
import fs from 'fs'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// Function to find the git repository root
export function findGitRoot(startDir: string) {
    let currentDir = startDir
    while (currentDir !== path.parse(currentDir).root) {
        const gitDir = path.join(currentDir, '.git')
        if (fs.existsSync(gitDir)) {
            return currentDir
        }
        currentDir = path.dirname(currentDir)
    }
    throw new Error('Not in a git repository')
}

// export const dir = findGitRoot(__dirname)