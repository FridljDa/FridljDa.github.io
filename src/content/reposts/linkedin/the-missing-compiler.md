---
status: draft
images:
  - /images/blog/the-missing-compiler/linkedin/review-screen.png
firstComment: |
  The full post, with the loop step by step, the other thing we waited on (endpoints from the client's IT) and where I expect the bottleneck to move next: https://danielfridljand.de/post/the-missing-compiler
---
A coding agent wrote our fixes overnight, so our customer support automation moved only as fast as domain experts could grade its replies.

The agent learns on every attempt whether its code works: tests, linters and the compiler tell it. A reply to a customer has no compiler. The only check is someone who knows the business reading it.

Those people can rarely list their rules up front, but shown a wrong reply, they can tell you at a glance what is wrong. The expert's comment in the picture holds two rules nobody had written down.

Once I had written a high-level plan for a fix, the agent implemented it overnight and evals and CI checked it, with little of my time. The grading set the pace.

So if you estimate a project like this, the experts' availability is a hard input, not a detail to sort out later. Two things follow:

→ Get them grading real drafts as early as possible, before any reply reaches a customer. We waited until replays of old tickets looked good, and the grades the experts could have given in those weeks are lost for good.

→ Make each grade quick to give. A narrow review screen that shows the ticket and the draft and nothing else is worth building yourself; every click you remove gives the experts time back.

Full post in the first comment.

#AIAgents #LLM #Evals #CustomerSupport
