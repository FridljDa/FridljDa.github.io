---
status: draft
images:
  - /images/blog/the-missing-test-suite/linkedin/verdict.png
  - /images/blog/the-missing-test-suite/linkedin/review-screen.png
firstComment: |
  The full post, with the loop step by step, the approval rate it is meant to raise (and why that is not a saving), and which part of the review tool to build yourself: https://danielfridljand.de/post/the-missing-test-suite
---
Coding agents made code cheap. On a support automation I built, that moved the bottleneck to the experts who could tell if a reply was right.

A coding agent gets a free verdict on every attempt from tests and linters, so it can work through a problem without anyone watching. A reply to a customer has no test suite. The only check is an expert who knows the business reading it.

Goldratt's theory of constraints says fixing a bottleneck doesn't remove it; it moves it somewhere else. Without a coding agent, every fix would have gone through me, code included. With one, a fix I had planned was a branch, an eval case and a green build by the next morning, with little of my time. What limited progress was finding out what to fix, and that ran on the experts' time.

The experts are also where the rules live. They can rarely list them up front, but shown a draft, they see at a glance what's wrong with it. In the second picture, the draft asks a customer with a locked account for their email address. The expert's comment states two rules nobody had written down: never ask for what we can find, and locked accounts get the unlock link, or go to security if flagged. So grading does two jobs: it's the check a coding agent gets from its tests, and it's how the rules get written down. The comment below the expert's is my plan, which the coding agent builds overnight.

If the experts' time is the constraint, their availability is a hard input when you plan the project, not a detail to sort out later. Get them grading real output as early as possible. I waited for acceptable numbers on old tickets first, and the grades they could have given in those weeks are lost for good. And make each grade quick to give. Our experts were the support staff answering those tickets anyway: they graded each draft as they picked up its ticket, and an approved one was a reply they didn't have to write.

Coding agents didn't remove the hard part. They made it obvious where it was.

Full post in the first comment.

#AIAgents #LLM #Evals #CustomerSupport
