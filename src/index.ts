import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {retrieveChangedFiles} from "./github/retrieve-changed-files.js";


// Create server instance
const server = new McpServer({
    name: "weather",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

// Register weather tools
server.tool(
  "generate-report",
  ` Generate a report bese on github commits and specifically with the changes of each file in the propertie "patch" and with the "commitMessage" and all the changed files. The reports has to have the following structure: 
  
    **CHANGELOG :rocket: #UPDATE {UPDATE NUMBER}**

    'A list of changes made in the last update, including new features, bug fixes, and improvements. Each change should be described in a single line with a maximum of 100 characters. The list should be formatted as follows:'
    :white_check_mark: {CHANGE DESCRIPTION IN UPPERCASE IN SPANISH}
  `,
  {
    startDate: z.string().describe("Date to start the report from, in ISO format (YYYY-MM-DD)"),
    untilDate: z.string().optional().describe("Date to end the report at, in ISO format (YYYY-MM-DD) is non required if is not provided set to the actual date in iso format"),
    branch: z.string().describe("Branch to filter commits by, if not provided all branches will be considered"),
  },
  async ({ startDate,untilDate,branch }) => {
    const changedFiles = await retrieveChangedFiles({ startDate,untilDate,branch});
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(changedFiles, null, 2)
        }
      ]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Github report MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});