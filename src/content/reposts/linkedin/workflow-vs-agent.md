---
status: draft
images:
  - /images/blog/workflow-vs-agent/unlock-tool.png
firstComment: |
  The full post, with the grid of request types and account states a workflow has to fill, how the same tool makes a wrong account match harmless, what an agent as the default costs and when a kind of request moves into code, and the one case where I would still give an action its own path in code: https://danielfridljand.de/post/workflow-vs-agent
---
On a bank's support automation, we put nearly every decision in code. One reason was good: no unlock instructions may go to an account with a security flag. The other was how we graded the replies.

Leave the order of steps to the model, and nothing guarantees it checks the flag before it sends unlock instructions. A customer's message might even talk it out of the check. So code decided the sequence, in a decision tree for each kind of request.

The complaint that actually drove the decision was a different one: the agent's replies didn't match the bank's message templates. No test can tell you whether a reply is right; someone who knows the bank has to read it, and what they check for becomes the specification. Judged on template match, code can't lose, because code picks the template. The grading, more than the task, picked the architecture.

The tree needed a branch for every kind of request against every state an account can be in. It ran out on rarer requests, and on common ones on accounts in states we had no rule for.

Yet the flag check never needed the tree. It fits inside the unlock tool: the tool reads the flag itself and refuses if it is set, whatever the agent asked and the customer wrote.

To sort a decision, ask what one mistake would be. If a single violation would be an incident, it is a rule, and it goes in a tool. If it would be a reply an expert rejects, it is policy: the agent follows it, and the grading catches it when it doesn't.

An expert's comment on one rejected draft, for a customer locked out of their account, held one of each. "Locked accounts get the unlock link, or go to security if flagged" is the flag check, already in the tool. "Never ask for what we can find" is policy, for the agent's instructions. Neither needs a new kind of request in the tree. With code as the default, we added one.

Next time I would make the agent the default, acting only through tools that hold the rules. A kind of request moves into code once the experts' grades show it is common and the agent gets it wrong, and I would have them grade on the customer's problem, not on templates.

Full post in the first comment.

#AIAgents #LLM #SoftwareArchitecture #CustomerSupport
