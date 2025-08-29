import fs from 'fs'
import git from 'isomorphic-git'
import { Props } from '../types/local-client.t.js'
import { ReportModelContextFormat } from '../types/main.t.js'

export async function getCommitsWithFiles({ startDate, untilDate, branch = 'master', author,dir }: Props & {dir: string}) {
  try {
    // Ensure startDate is in ISO format
    if (!startDate || isNaN(new Date(startDate).getTime()) || untilDate && isNaN(new Date(untilDate).getTime())) {
      throw new Error("Invalid date format. Please provide a valid ISO date string.")
    }

    // Try to get commits from the specified branch or fall back to the default branch
    let commits
    try {
      commits = await git.log({ fs, dir, ref: branch })
    } catch (error) {
      // If branch not found, try getting available branches and use the first one
      const branches = await git.listBranches({ fs, dir })
      console.log(`Branch ${branch} not found. Available branches:`, branches)
      if (branches.length === 0) throw new Error('No branches found in repository')
      branch = branches[0]
      console.log(`Using branch: ${branch}`)
      commits = await git.log({ fs, dir, ref: branch })
    }

    const start = new Date(startDate)
    const end = untilDate ? new Date(untilDate) : new Date()

    const filteredCommits = commits.filter(c => {
      const dt = new Date(c.commit.committer.timestamp * 1000)
      // Filter by date and author if provided
      return dt >= start && dt <= end &&
        (!author || c.commit.author.email === author || c.commit.committer.email === author)
    })

    // Get file changes for each commit
    const relevantFileInformation = await Promise.all(filteredCommits.map(async commit => {
      try {
        const parentSha = commit.commit.parent[0] || await git.findMergeBase({
          fs,
          dir,
          oids: [commit.oid, await git.resolveRef({ fs, dir, ref: 'HEAD' })],
        })

        // Get changes between parent commit and this commit
        const changes = await git.walk({
          fs,
          dir,
          trees: [
            // @ts-ignore
            git.TREE({ ref: parentSha }),
            git.TREE({ ref: commit.oid })
          ],
          map: async function (filepath, [A, B]) {
            // Skip directories
            if (filepath === '.') return
            if ((await A?.type()) === 'tree' || (await B?.type()) === 'tree') return

            // Get content
            const Aoid = await A?.oid()
            const Boid = await B?.oid()

            let patch = undefined
            let status = 'unchanged'

            if (Aoid !== Boid) {
              if (Aoid && Boid) {
                status = 'modified'
                const Acontent = await A?.content()
                const Bcontent = await B?.content()
                if (Acontent && Bcontent) {
                  // Convert Buffer to actual text, forcing UTF-8 interpretation
                  const oldContent = Buffer.from(Acontent).toString('utf8')
                  const newContent = Buffer.from(Bcontent).toString('utf8')

                  // Create a simple patch format
                  patch = `@@ -1,1 +1,1 @@\n-${oldContent}\n+${newContent}`

                  // Debug - check what we're getting
                  console.log("File:", filepath);
                  console.log("Old content type:", typeof oldContent);
                  console.log("New content type:", typeof newContent);
                }
              } else if (!Aoid && Boid) {
                status = 'added'
                const Bcontent = await B?.content()
                if (Bcontent) {
                  const newContent = Buffer.from(Bcontent).toString('utf8')
                  patch = `@@ -0,0 +1,1 @@\n+${newContent}`
                }
              } else if (Aoid && !Boid) {
                status = 'removed'
                const Acontent = await A?.content()
                if (Acontent) {
                  const oldContent = Buffer.from(Acontent).toString('utf8')
                  patch = `@@ -1,1 +0,0 @@\n-${oldContent}`
                }
              }

              return {
                commitMessage: commit.commit.message,
                filename: filepath,
                status,
                patch
              } as ReportModelContextFormat
            }
            return null
          }
        })

        const changesO = changes.filter(Boolean) as ReportModelContextFormat[]
        console.log(changesO)
        return changesO
      } catch (error) {
        console.error(`Error getting files for commit ${commit.oid}:`, error)
        return []
      }
    }))

    return relevantFileInformation
  } catch (error) {
    console.error("Error retrieving changed files:", error)
    return []
  }
}

// Example usage:
try {
  const files = await getCommitsWithFiles({
    startDate: '2025-07-09T19:21:32.000Z',
    // untilDate: '2025-07-10T19:21:32.000Z',
    branch: 'main',
    author: 'baltazarosebas@gmail.com',
    dir: '/home/sebastian/Documents/dev/mcps/github-report-mcp' // Replace with your actual repo path
  })
  console.log(JSON.stringify(files, null, 2))
} catch (error) {
  console.error('Failed:', error)
}

// await getCommits({
//   startDate: '2025-07-09T19:21:32.000Z',
//   // untilDate: '2025-07-10T19:21:32.000Z',
//   branch: 'main',
//   author: 'baltazarosebas@gmail.com'
// })
// ...Then for each commit you can get the files with further git plumbing commands
