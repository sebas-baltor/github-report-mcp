import { execSync } from "child_process";
import { Props } from "../types/local-client.t.js";
import { getShas, getFilesForSha, getPatchForFile } from "../lib/local/retrieve.js";
// Get commit hashes between dates (ISO 8601)
function getCommits({ startDate, untilDate, branch, author="" }: Props) {
  const until = untilDate || new Date().toISOString();
  const command = `git log ${branch} --author="${author}" --since="${startDate}" --until="${until}" --pretty=format:"%H"`;
  return execSync(command).toString().trim().split("\n").filter(Boolean);
}

// Get changed files for a commit
function getFilesForCommit(commitSha: string) {
  // Only files, no diff content. Use --name-status for status
  const files = execSync(`git show --name-status --format= ${commitSha}`)
    .toString()
    .trim()
    .split("\n")
    .filter(Boolean)
    .map(line => {
      const [status, ...filename] = line.split(/\s+/);
      return { status, filename: filename.join(" ") };
    });
  return files;
}

// Putting it together
export async function retrieveLocalChangedFiles({ startDate, untilDate, branch ="main",author }: Props) {
  try {
    // const commits = getCommits({ startDate, untilDate, branch, author });
    // let relevantFileInformation = commits.map(sha => {
    //   const files = getFilesForCommit(sha);
    //   return files.map(file => ({
    //     commitSha: sha,
    //     ...file
    //   }));
    // });
    // return relevantFileInformation.flat();

    const shas = await getShas(author,startDate, branch, untilDate);
    let localChangedFiles=[];
    for (const sha of shas) {
      console.log(`=== COMMIT ${sha} ===`)
      for (const file of await getFilesForSha(sha)) {
        console.log(`--- FILE ${file} ---`)
        const patch = await getPatchForFile(sha, file)
        console.log(patch)
      }
    }
  } catch (error) {
    console.error("Error retrieving changed files:", error);
    return [];
  }
}

// Example usage:
retrieveLocalChangedFiles({
  startDate: "2025-07-09T19:21:32.000Z",
  // untilDate: "2024-07-01T00:00:00Z",
  branch: "main",
  author: "baltazarosebas@gmail.com"
}).then(console.log);
