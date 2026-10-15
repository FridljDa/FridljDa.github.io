---
status: draft
images:
  - /images/blog/workflow-vs-agent/linkedin/unlock-tool.png
firstComment: |
  The full post, with every request type against every account state a decision tree has to cover, how the same tool makes it harmless when the model picks the wrong account, what starting with the model in charge costs, and the one kind of action I would still give its own path in code: https://danielfridljand.de/post/workflow-vs-agent
---
On a bank's support automation, we put nearly every decision in code. The one check that justified it would have fit inside a single tool.

The check: no unlock instructions may go to an account with a security flag. Leave the order of steps to the model, and nothing guarantees it looks at the flag first. A customer's message might even talk it out of looking. So code decided every step, in a decision tree for each kind of request, and the model only read the customer's message.

That was the good reason. What actually drove the decision was a complaint that the model's replies didn't match the bank's message templates. Judged on template match, code can't lose, because code picks the template. How we judged the replies, more than the task, picked the architecture.

The tree needed a branch for every kind of request against every state an account can be in. It ran out on rarer requests, and on common ones when the account was in a state nobody had written a branch for. A locked-account branch that never asks whether the account is open would send a closed account the unlock steps, without anyone deciding that.

Yet the flag check never needed the tree. The unlock tool, the code that actually sends the instructions, can read the flag itself and refuse if it is set, whatever the model asked for and whatever the customer wrote.

So I sort each decision by asking what one mistake would be. If a single slip would be an incident, the check goes inside the tool that carries out the action. If it would be a reply a support expert sends back, like asking a customer for details we can already look up, the model makes the call, and the experts' review catches it when it gets it wrong.

Next time I would start with the model in charge, acting only through tools that hold those checks. A kind of request would get its own path in code once the experts' reviews show it is common and the model gets it wrong.

Full post in the first comment.

#AIAgents #LLM #SoftwareArchitecture #CustomerSupport
