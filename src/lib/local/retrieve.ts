import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export async function getShas(author:string, since:string, branch:string, until?:string) {
  const untilParam = until ? `--until="${until}"` : '';
  const cmd = `git rev-list ${branch} --author="${author}" --since="${since}" ${untilParam}`
  const { stdout } = await execAsync(cmd)
  return stdout.split('\n').filter(Boolean)
}

export async function getFilesForSha(sha:string) {
  const cmd = `git diff-tree --no-commit-id --name-only -r ${sha}`
  const { stdout } = await execAsync(cmd)
  return stdout.split('\n').filter(Boolean)
}

export async function getPatchForFile(sha:string, file:string) {
  const cmd = `git show ${sha} -- ${file}`
  const { stdout } = await execAsync(cmd)
  return stdout
}