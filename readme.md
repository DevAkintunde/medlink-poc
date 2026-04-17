# IMPORTANT POINTERS
  - All endpoint is preceeded by the specific api version for easy functional migration across api versions in the future: "/<API version>/*"
  - Swagger doc is available for all servers at "/<API version>/docs"
  - There is a base config file called 'platform.config' that controls all services. This config file is however imported to each service as app.config. Therefore any customisation can be done here to override configurations per service

# HOW TO

# Project Help - DEV
You should preferably stay in the root directory and use the --filter flag. You almost never need to cd into the subfolders.
 - To add a package to a specific service:
    - pnpm add koa --filter auth-service

 - To add same package to all services:
    - pnpm add koa --filter "./apps/**"

  - To add a shared/common internal library to a service:
    - pnpm add @medlink/common --filter auth-service --workspace

  - To install everything in the whole repo:
    - pnpm install

Only use the root package.json for:
  - Dev-wide tools: Things that apply to the whole repo, like prettier, eslint, or typescript.
  - Global scripts: Shortcuts like "build:all": "pnpm -r run build".





