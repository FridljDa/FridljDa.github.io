---
status: draft
images:
  - /images/blog/workflow-vs-agent/linkedin/grid.png
firstComment: |
  The full post, with the grid of request types against account states a decision tree has to cover, the caveats of putting the agent in charge, and when a request type should still get its own path in code: https://danielfridljand.de/post/workflow-vs-agent
---
On a bank's support automation, we put code in charge of the order of operations and gave the model one job: reading the customer's message. Next time I would do it the other way round.

There was a real reason for code. Our first design was one agent holding every tool, and nothing guaranteed it would check an account's security flag before sending unlock instructions. A customer's message might even talk it out of the check.

But what drove the decision was a complaint that the agent's replies didn't match the bank's message templates. Judged on template match, code can't lose, because code picks the template.

For a locked account, the workflow was the clear fit: explicit logic, few cases, a guaranteed template. Then it ran out. A workflow needs a branch for every kind of request against every state the account behind it can be in. A handful of request types covered most messages, but not most of those combinations, and every new state meant another branch and another template.

So we bolted an agent onto the tree for the requests it didn't cover. It got the leftovers and was still graded on template match. We were asking it to be a worse workflow.

Next time I would make the agent the default. A kind of request would get its own path in code only once it is common and the agent gets it wrong, or when its action can't be undone.

Neither design tells you which paths deserve code. Only the people who know the business can, by grading the system's drafts, so I would get them grading before committing to a tree.

Full post in the first comment.

#AIAgents #LLM #SoftwareArchitecture #CustomerSupport
