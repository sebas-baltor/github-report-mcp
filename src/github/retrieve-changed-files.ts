import octokit, { login } from '../lib/github/octokit-client.js'
export async function retrieveChangedFiles({startDate,untilDate,branch}:{
    startDate: string,
    untilDate?: string,
    branch:string,
}) {
    try {
        // Ensure startDate is in ISO format
        if (!startDate || isNaN(new Date(startDate).getTime()) || untilDate && isNaN(new Date(untilDate).getTime())) {
            throw new Error("Invalid date format. Please provide a valid ISO date string.");
        }
        const commits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
            owner: 'Ederjoel26',
            repo: 'BetOnFire',
            author: login,
            since: startDate,
            until:untilDate ||  new Date(Date.now()).toISOString(),
            sha: branch,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
    
        let relevantFileInformation = await Promise.all(commits.data.map(async commit => {
            return await octokit.rest.repos.getCommit({
                owner: 'Ederjoel26',
                repo: 'BetOnFire',
                ref: commit.sha
            }).then(response => {
                return response.data.files?.map(file => ({
                    commitMessage: response.data.commit.message,
                    filename: file.filename,
                    status: file.status,
                    // changes: file.changes,
                    patch: file.patch,
                    // raw_url: file.raw_url
    
                }))
            })
        }))
        return relevantFileInformation
    }catch (error) {
        console.error("Error retrieving changed files:", error);
        return [];
    }

}