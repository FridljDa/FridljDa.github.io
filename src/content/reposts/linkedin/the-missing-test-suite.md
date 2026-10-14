---
status: draft
images:
  - /images/blog/the-missing-test-suite/linkedin/verdict.png
  - /images/blog/the-missing-test-suite/linkedin/review-screen.png
firstComment: |
  The full post, with the loop step by step, the approval rate it is meant to raise (and why that is not a saving), and which part of the review tool to build yourself: https://danielfridljand.de/post/the-missing-test-suite
---
Coding agents made code cheap. On a support automation I built, that moved the bottleneck to the experts who could tell if a reply was right.

In code, tests and linters catch much of what can go wrong, and a coding agent gets their verdict on every attempt for free. A reply to a customer has nothing comparable: the only check is an expert who knows the business reading it.

Goldratt's theory of constraints says fixing a bottleneck doesn't remove it; it moves it somewhere else. Without a coding agent, every fix would have gone through me, code included. With one, a fix I had planned was a branch, an eval case and a green build by the next morning, with little of my time. What limited progress was finding out what to fix, and that ran on the experts' time.

The experts are also where the rules live. They can rarely list them up front, but shown a draft, they see at a glance what's wrong with it. In the review screen below, the draft asks a customer with a locked account for their email address. The expert's comment states two rules nobody had written down: never ask for what we can find, and locked accounts get the unlock link, or go to security if flagged. So grading does two jobs: it's the check a coding agent gets from its tests, and it's how the rules get written down.

My own job was design. The architecture had to meet the requirements and split decisions between code and model the way I wanted. It also had to turn most expert feedback into a local change: a new intent, or a new branch in the rules behind one. A change that local fits in two sentences, and I could hand it to a coding agent and trust the result. My comment below the expert's is such a plan; the agent built it overnight.

I also designed the loop around the experts, to make grading easy for them, because their time was the constraint. They were the support staff answering those tickets anyway, so they graded each draft as they picked up its ticket, on a screen with the customer's message and the draft. An approved draft was a reply they didn't have to write. My follow-up questions waited next to the ticket instead of in direct messages, which is how one developer could work with ten experts.

Coding agents didn't remove the hard part. They made it obvious where it was.

Full post in the first comment.

#AIAgents #LLM #Evals #CustomerSupport
