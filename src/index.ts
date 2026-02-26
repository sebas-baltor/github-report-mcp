import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { retrieveChangedFiles } from "./github/retrieve-changed-files.js";
import { GeneralReportDescriptionTool } from "./lib/const/descriptions.js";
import { findGitRoot } from "./lib/local/find-repo.js";
import { getCommitsWithFiles } from "./local/isomorphic-client.js";

// Create server instance
const server = new McpServer({
  name: "report-generator",
  version: "1.0.0",
  // capabilities: {
  //   resources: {},
  //   tools: {},
  // },
});
// Register weather tools
server.registerTool(
  "generate-report",
  {
    description: `Generate a report bese on github commits and ${GeneralReportDescriptionTool}`,
    inputSchema: {
      startDate: z.string().describe("Date to start the report from, in ISO format (YYYY-MM-DDThh:mm:ss.sssZ)"),
      untilDate: z.string().optional().describe("Date to end the report at, in ISO format (YYYY-MM-DDThh:mm:ss.sssZ) is non required if is not provided init base to the actual date in iso format"),
      branch: z.string().describe("Branch to filter commits by, if not provided all branches will be considered"),
    },
  },
  async ({ startDate, untilDate, branch }) => {
    try {
      const changedFiles = await retrieveChangedFiles({ startDate, untilDate, branch });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(changedFiles, null, 2)
          }
        ]
      };
    } catch (error: any) {
      console.error("Error generating report:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error generating report: ${error.message}`
          }
        ]
      };
    }
  }

);

server.registerTool(
  "generate-local-report",
  {
    description: ` Generate a report bese on git commits on my local machine only if is not specified that you are going to find this information to github and ${GeneralReportDescriptionTool}`,
    inputSchema: {
      startDate: z.string().describe("Date to start the report from, in ISO format (YYYY-MM-DDThh:mm:ss.sssZ:)"),
      untilDate: z.string().optional().describe("Date to end the report at, in ISO format (YYYY-MM-DDThh:mm:ss.sssZ) is non required if is not provided set to the actual date in iso format"),
      branch: z.string().describe("Branch to filter commits by, if not provided dont worry to set a value is not necesary just set a simple empty string"),
      author: z.string().describe("This is a email of the author that wrote the commits in the local stage usually is the same user that is running the mcp server"),
      dir: z.string().describe("Directory of the git repository, if not provided will use the current directory where the mcp server is running"),
    },
  },
  async ({ startDate, untilDate, branch, author, dir }) => {
    try {
      const rightDir = findGitRoot(dir);
      // const { retrieveLocalChangedFiles } = await import("./local/local-client.js");
      const changedFiles = await getCommitsWithFiles({ startDate, untilDate, branch, author, dir: rightDir });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(changedFiles, null, 2)
          }
        ]
      };
    } catch (error: any) {
      console.error("Error generating local report:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error generating local report: ${error.message}`
          }
        ]
      };
    }
  }
)

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Github report MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});