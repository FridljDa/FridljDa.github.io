---
status: draft
images:
  - /images/blog/the-missing-test-suite/linkedin/verdict.png
  - /images/blog/the-missing-test-suite/linkedin/review-screen.png
firstComment: |
  The full post, with the loop step by step, the approval rate it is meant to raise (and why that is not a saving), which part of the review tool to build yourself, and where I expect the bottleneck to move next: https://danielfridljand.de/post/the-missing-test-suite
---
Once code is cheap, what becomes the bottleneck?

On the support automation I built, it was the people who could tell whether a reply was right.

A coding agent gets a verdict on every attempt for free: tests, linters, error messages. A reply to a customer has no test suite. The only check is someone who knows the business reading it.

That set the pace. A fix I had specified was a branch, an eval case and a green build by the next morning. What I couldn't speed up was finding out what to fix.

Three things I'd keep:

1. Experts can't list their rules, but they can grade.
The people who know a business can rarely write its rules down in advance. Shown a draft, they see at a glance what's wrong. The one rejection comment in the second picture holds two rules nobody had written down.

2. Put them in front of live drafts early.
I waited for good offline numbers on old tickets before going into shadow deployment. That had it backwards. A replayed ticket runs against today's records: a month later, the locked account in it may already be unlocked. Only drafts for live tickets see what the customer saw. And the grades the experts could have given in the weeks before are lost for good.

3. Make each grade cheap.
The experts were the support staff answering those tickets anyway. They graded each draft as they picked up its ticket and pasted the good ones into their reply. One shared queue, ten experts, one developer, no direct messages: my follow-up questions waited next to the ticket.

Then the bottleneck moved again. Turning the experts' comments into a plan for the coding agent was my job, which puts me on the critical path of every fix. An agent that rewrites its own skills from each batch of grades could take that over. But the only thing that would catch it drifting from how the business works is the experts' grading: the bottleneck we started with.

Coding agents didn't remove the hard part. They made it obvious where it was.

Full post in the first comment.

#AIAgents #LLM #Evals #CustomerSupport
