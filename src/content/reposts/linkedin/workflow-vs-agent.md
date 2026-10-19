---
status: draft
image: /images/blog/workflow-vs-agent/linkedin/agent-by-default.png
comments:
  - text: |
      The full post, with how a customer's message can talk a single agent out of the flag check, how grading drafts on template match tilted the choice toward code, the grid of request types and account states a workflow has to spell out, and the caveats of making the agent the default: https://danielfridljand.de/post/workflow-vs-agent
---
Who should decide the next step in an LLM automation, code or the model? I'd let the model decide by default, and make code earn its place.

When code decides, it's a workflow: the model only fills in single steps, like reading the customer's message. When the model decides which tool to call next, it's an agent.

On a support automation I built, the workflow earned its place for the well-understood requests. For a locked account, code checks the security flag before any unlock steps go out, every time. A prompt can ask for that order; only code guarantees it.

But a workflow only answers what someone wrote a branch for. A few request types covered most messages, yet each still needed a branch for every state an account can be in, and the rarer requests needed branches of their own. The branches grew faster than the share of tickets the workflow could answer.

An agent with a set of tools doesn't need all of that written out first. It won't get every case right either, but it is much less to build, so the people who know the business can start grading its drafts sooner. Any plan that touches account access would still wait for a person to approve it.

Code would then take over a request type only once it has earned it, as in the picture below: the type is common and the graders keep rejecting the agent's drafts for it, or its action can't be undone. Everything else stays with the agent.

Full post in the first comment.

#AIAgents #LLM #SoftwareArchitecture #CustomerSupport
