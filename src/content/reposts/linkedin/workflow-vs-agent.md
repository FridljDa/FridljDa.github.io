---
status: draft
images:
  - /images/blog/workflow-vs-agent/linkedin/grid.png
firstComment: |
  The full post, with why a single agent can't guarantee the flag check comes first, how grading drafts on template match tilts the choice toward code, and the caveats of making the agent the default: https://danielfridljand.de/post/workflow-vs-agent
---
Workflow or agent? In an LLM automation, make the agent the default and let code earn its place.

A kind of request should get its own path in code only once it is common and the agent gets it wrong, or once its action can't be undone. Everything else stays with an agent and its tools.

I've built both on a support automation, and for locked accounts the workflow was the clear fit. I put code in charge of the steps and gave the model one job: reading the customer's message. Verified account: send the unlock steps. Flagged: escalate to security. The flag is checked before any unlock instructions go out, every time. A prompt can ask for that order; only code guarantees it.

Now make the account closed. Same request, but it lands in a cell nobody decided: top right in the picture.

A workflow answers only what someone wrote a branch for, and the branches form a grid: every kind of request against every state the account can be in. A few request types covered most messages, which is what makes a tree tempting. They didn't cover most cells, and every new state meant another branch and another template.

An agent with a set of tools doesn't shrink that grid, but it spares you writing it out before you know which cells matter. It is also much less to build, so the people who know the business can start grading its drafts sooner. A plan that touches account access would still wait for a person to approve it.

Neither design tells you which cells deserve code. Those people do, by grading the system's drafts. Where a request type is common and they keep rejecting the agent's drafts, that path has earned its code.

Full post in the first comment.

#AIAgents #LLM #SoftwareArchitecture #CustomerSupport
