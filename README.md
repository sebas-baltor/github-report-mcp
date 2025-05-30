# GitHub Report MCP

## Prerequisites

- **Node.js** (latest version recommended)
- **npm** (comes with Node.js)

## Installation & Setup

1. **Clone the repository**
    ```bash
    git clone <repository-url>
    cd github-report-mcp
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Environment Configuration**
    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - Open `.env` file and fill in your GitHub token:
      ```
      GITHUB_TOKEN=your_github_token_here
      ```

4. **Compile the code**
    ```bash
    npm run build
    ```

## MCP Client Configuration

After compilation, reference the built file in your MCP client:

### For Claude Desktop
Add to your Claude configuration file:
```json
{
  "mcpServers": {
    "github-report": {
      "command": "node",
      "args": ["path/to/your/built/file.js"]
    }
  }
}
```

### For VS Code
Configure the MCP extension to point to your compiled output file.

## Getting a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with appropriate repository permissions
3. Copy the token and paste it in your `.env` file