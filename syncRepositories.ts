import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const SYNC_DIR = 'sync'
const DOCS_DIR = 'docs'

type RepoData = {
    repository: string;
    organization: string;
  };

function padNumber(num: number): string {
    return num.toString().padStart(3, '0')
}

function createSymlink(sourcePath: string, index: number, repoName: string, subdir: string, targetSubdir: string = subdir, prefixTargetSubPath: boolean = true): void {
    const sourceSubPath = path.join(sourcePath, 'docs', subdir)
    const targetName = prefixTargetSubPath ? `${padNumber(index)}-${repoName}` : repoName
    const targetDir = path.join(DOCS_DIR, targetSubdir);
    const targetSubPath = path.join(targetDir, targetName)

    if (fs.existsSync(sourceSubPath)) {

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true })
        }

        if (fs.existsSync(targetSubPath)) {
            fs.unlinkSync(targetSubPath)
        }
        fs.symlinkSync(path.resolve(sourceSubPath), path.resolve(targetSubPath), 'dir')
    }
}

function syncRepositories(): void {
    // Create necessary directories
    if (!fs.existsSync(SYNC_DIR)) {
        fs.mkdirSync(SYNC_DIR, { recursive: true })
    }
    if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true })
    }

    // Read repositories.json
    const repoData: RepoData[] = JSON.parse(
        fs.readFileSync('repositories.json', 'utf-8')
    )

    console.log(repoData);

    repoData.forEach((repoEntry, index) => {
        const url = `https://github.com/${repoEntry.organization}/${repoEntry.repository}.git`
        const repoName = url.split('/').pop()?.replace('.git', '') || ''
        const repoPath = path.join(SYNC_DIR, repoName)

        // Clone or update repository
        if (!fs.existsSync(repoPath)) {
            console.log(`Cloning ${repoName}...`)
            execSync(`git clone ${url} ${repoPath}`)
        } else {
            console.log(`Updating ${repoName}...`)
            execSync('git pull', { cwd: repoPath })
        }

        createSymlink(repoPath, index, repoName, 'api')
        createSymlink(repoPath, index, repoName, 'product', 'products')
        createSymlink(repoPath, index, repoName, 'static', 'static', false)
    })
}

syncRepositories();