---
status: draft
images:
  - /images/blog/workflow-vs-agent/linkedin/grid.png
firstComment: |
  The full post, with the grid of request types against account states a decision tree has to cover, the agent that got the requests the tree couldn't, and the caveats of making the agent the default: https://danielfridljand.de/post/workflow-vs-agent
---
The first decision in an LLM automation: does code run the order of operations, or does the model? I'd now make the model the default, and make code earn its place.

A kind of request gets its own path in code once it is common and the agent gets it wrong, or when its action can't be undone. Everything else stays with an agent and its tools.

I've built the other default. On a support automation, code ran the order of operations and the model had one job: reading the customer's message. For a locked account, that was the clear fit. The logic is explicit, the cases are few, and code guarantees the security flag is checked before any unlock instructions go out.

But a workflow needs a branch for every kind of request against every state the account behind it can be in. A handful of request types covered most messages, but not most of those combinations, and every new state meant another branch and another template.

Watch what you grade on, too. The push toward code came less from the security check than from a complaint that replies didn't match the message templates. Judged on template match, code can't lose, because code picks the template. An agent added later for the requests the tree didn't cover was graded the same way, so a clearer answer in its own words scored badly. That is asking an agent to be a worse workflow.

So I'd start with an agent and a set of tools. It is much less to build than a tree of request types and templates, so the experts see real drafts sooner. Anything that touches account access still waits for a person to approve it.

Neither design tells you which paths deserve code. Only the people who know the business can, by grading the system's drafts. Get them grading before you commit to a tree.

Full post in the first comment.

#AIAgents #LLM #SoftwareArchitecture #CustomerSupport
