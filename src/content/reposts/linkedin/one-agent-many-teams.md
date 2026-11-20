---
status: draft
image: /images/blog/one-agent-many-teams/linkedin/three-ways.png
comments:
  - text: |
      The full post, with what Shopify, Sierra, Cognition and monday.com report about one loop versus subagents, how skills, MCP servers and eval cases each plug in, and what the platform team costs: https://danielfridljand.de/post/one-agent-many-teams
---
When several teams build one AI agent, split the ownership between them, not the agent.

Anthropic recently advised against giving each team its own subagent, and I've seen products fail that way. Picture a support agent with one subagent per team behind a router. A customer writes that their account is locked and their card was blocked too. The accounts subagent hands the card over to the cards subagent, but the handoff carries "card blocked", not the account number. So the reply asks the customer for something they already wrote.

I've also seen the opposite fail. When one team owns the whole agent, every other team's change queues behind it, and the teams who know their systems best end up writing tickets. Teams need to ship without waiting for each other.

What I'd do is the third panel in the picture below, "One loop, many owners". A platform team owns the agent loop, the system prompt and a shared eval gate. Each feature team contributes three things without touching the model or the prompt: a skill that says how it handles its cases, an MCP server with its tools, and eval cases.

One loop does couple the teams: they share the model's context and can break each other's conversations. The gate keeps that coupling in a test suite instead of in meetings. A change that passes needs no sign-off. A team is blocked only by its own cases and a short list of conversations nobody may break; if it breaks another team's case, that team gets a report, and the change still ships.

#AIAgents #LLM #SoftwareArchitecture #PlatformEngineering
