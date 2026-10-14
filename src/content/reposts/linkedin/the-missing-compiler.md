---
status: draft
images:
  - /images/blog/the-missing-compiler/linkedin/review-screen.png
firstComment: |
  The full post, with the loop step by step, the other thing we waited on (endpoints from the client's IT) and where I expect the bottleneck to move next: https://danielfridljand.de/post/the-missing-compiler

  On whether SaaS survives cheap code, Jamin Ball's "Build vs Buy": https://cloudedjudgement.substack.com/p/clouded-judgement-21326-build-vs
---
A coding agent turned each fix I planned into a green build overnight.
The project still moved only as fast as experts could grade replies.

Tests, linters and the compiler tell a coding agent on every attempt whether its code works.

A reply to a customer has no compiler.

The only check is someone who knows the business reading it. In the picture, our system asked a locked-out customer for their email, though they had already given their account number. Experts can rarely list their rules up front, but shown a draft, they see at a glance what's wrong. The expert's comment holds two rules nobody had written down.

Grading is one more task in a day that is already full, for people who may suspect they're training their own replacement. If you estimate a project like this, their time is a hard input, not a detail to sort out later.

→ Get them grading early. In a shadow deployment, the system drafts replies to live tickets, experts grade them, and no customer sees any. We waited until replays of old tickets looked acceptable, and the grades the experts could have given in those weeks are lost for good.

→ Make each grade quick. A narrow review screen with the ticket, the draft and nothing else is worth building yourself.

→ Don't build the storage behind it. I wrote ours from scratch and wouldn't again: the code was quick, the details were not. Build on an existing tool. Same reason SaaS isn't dead, however cheap code gets.

Coding agents didn't remove the hard part. They made it obvious where it was.

Full post in the first comment.

#AIAgents #LLM #Evals #CustomerSupport
