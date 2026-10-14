---
status: draft
images:
  - /images/blog/the-missing-compiler/linkedin/verdict.png
  - /images/blog/the-missing-compiler/linkedin/review-screen.png
firstComment: |
  The full post, with the loop step by step, the approval rate it is meant to raise (and why that is not a saving), which part of the review tool to build yourself, and where I expect the bottleneck to move next: https://danielfridljand.de/post/the-missing-compiler
---
A coding agent gets a verdict on every attempt from the compiler.
A reply to a customer gets one only when an expert reads it.

On the support automation I built, that set the pace. The coding agent turned a fix I had planned into a green build overnight. How many fixes there were to plan depended on how much the experts could read.

Their read is more than a check. Experts can rarely list their rules up front, but shown a draft, they see at a glance what's wrong. The expert's comment in the second picture holds two rules nobody had written down.

Two things looked like that check and weren't:

→ My own eval case. I wrote it from my plan for the fix, so it can't tell me whether I understood the expert. After every fix, the rejected ticket went back into the queue until an expert approved it.

→ Replays of old tickets. They run against today's records, not the ones the customer had when they wrote. Only drafts for live tickets, in shadow deployment, see the records the customer has, and I waited too long to start one.

So the experts' time is a hard input to the estimate. We made it go further with a shared annotation queue: one developer, ten experts, no direct messages. They graded a batch when their day had room, my follow-up questions waited next to the ticket, and a nightly run picked up every fix at once.

Coding agents didn't remove the hard part. They made it obvious where it was.

Full post in the first comment.

#AIAgents #LLM #Evals #CustomerSupport
