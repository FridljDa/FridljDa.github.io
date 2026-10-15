---
status: draft
images:
  - /images/blog/workflow-vs-agent/linkedin/grid.png
firstComment: |
  The full post, with how a customer's message can talk a single agent out of the flag check, how grading drafts on template match tilts the choice toward code, and the caveats of making the agent the default: https://danielfridljand.de/post/workflow-vs-agent
---
Workflow or agent? In an LLM automation, make the agent the default and let code earn its place.

A request type earns its own path in code only once it is common and the agent gets it wrong, or once its action can't be undone. Everything else stays with the agent.

I've tried both on a support automation I built, and for locked accounts the workflow was the clear fit. I put code in charge and gave the model one job: reading the customer's message. Verified account: send the unlock steps. Flagged: escalate to security. Code checks the flag before any unlock steps go out, every time. A prompt can ask for that order; only code guarantees it.

Now say the account is closed. Same request, and the workflow has no answer: top right in the picture below.

A workflow answers only what someone wrote a branch for, and the branches form a grid: every request type against every state the account can be in. In mine, a few request types covered most messages, which makes a workflow tempting. But each one still fanned out across every account state, and every new state meant another branch and another template.

An agent with a set of tools doesn't shrink that grid, but it spares you writing it out before you know which cells matter. For a locked account, it would check the flag and propose the unlock steps. As in my workflow, any plan that touches account access would still wait for a person to approve it. It is also much less to build, so the people who know the business can start grading its drafts sooner.

Neither design tells you which cells deserve code; the grades do. Where a request type is common and the graders keep rejecting the agent's replies, code has earned its place.

Full post in the first comment.

#AIAgents #LLM #SoftwareArchitecture #CustomerSupport
