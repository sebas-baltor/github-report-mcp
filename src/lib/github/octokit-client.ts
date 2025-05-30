import { Octokit, App } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_GENERAL_TOKEN,
});

const {
  data: { login },
} = await octokit.rest.users.getAuthenticated();

export default octokit;
export { login };