---
status: draft
images:
  - /images/blog/the-missing-test-suite/linkedin/verdict.png
  - /images/blog/the-missing-test-suite/linkedin/review-screen.png
firstComment: |
  The full post, with the loop step by step, the approval rate it is meant to raise (and why that is not a saving), which part of the review tool to build yourself, and where I expect the bottleneck to move next: https://danielfridljand.de/post/the-missing-test-suite
---
Coding agents made our code cheap. The bottleneck moved to the people who could tell whether a reply was right.

On the AI support automation I built, a coding agent got a verdict on every attempt for free, from tests and linters. A reply to a customer has no test suite. The only check is someone who knows the business reading it.

That set the pace. My coding agent turned a fix I had planned into a green build overnight. What limited progress was finding out what to fix.

Three lessons:

1. Experts can rarely list their rules, but they can grade.
Shown a draft, they see at a glance what's wrong. The expert's comment in the second picture holds two rules nobody had written down.

2. Put them in front of live drafts early.
I waited for acceptable scores on old tickets before letting the system draft replies to live ones, sent only once an expert approved. That had it backwards. A replayed ticket runs against today's records: a month later, the locked account in it may already be unlocked. And the grades the experts could have given in those weeks are lost for good.

3. Fit grading into their day.
The experts were the support staff answering those tickets anyway. They graded each draft as they picked up its ticket and pasted the good ones into their reply. Ten experts and one developer shared a single queue. My follow-up questions waited there, next to the ticket, instead of in direct messages.

Once the experts grade steadily, the next bottleneck is me: turning their comments into plans for the coding agent. Whatever takes that over still needs the experts to catch it drifting.

Coding agents didn't remove the hard part. They made it obvious where it was.

Full post in the first comment.

#AIAgents #LLM #Evals #CustomerSupport
