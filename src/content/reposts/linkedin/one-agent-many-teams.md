---
status: draft
image: /images/blog/one-agent-many-teams/linkedin/three-ways.png
comments:
  - text: |
      The full post, with what Shopify, Sierra, Cognition and monday.com report about one loop versus subagents, and how skills, MCP servers and eval cases each plug in: https://danielfridljand.de/post/one-agent-many-teams
---
When several teams build one AI agent, split the ownership between them, not the agent.

Anthropic recently advised against giving each team its own subagent, and I've seen products fail that way. Picture a support agent with one subagent per team behind a router. A customer writes that their account is locked and their card was blocked too. The accounts subagent hands the card over to the cards subagent, but the handoff carries "card blocked", not the account number. So the reply asks the customer for something they already wrote.

What I'd do is the third panel in the picture below, "One loop, many owners". A platform team owns the agent loop, the system prompt and one central eval set. Each feature team contributes three things without touching the model or the prompt: a skill that says how it handles its cases, an MCP server with its tools, and eval cases.

One loop does couple the teams: they share the model's context and can break each other's conversations. I've seen projects struggle when teams were coupled so tightly that none could work on its own. So changes go through pull requests: a team that adds a tool adds eval cases for it to one central eval set, CI runs the whole set, and if the existing cases aren't significantly broken, the team merges. The platform team maintains that path and shouldn't become the bottleneck.
