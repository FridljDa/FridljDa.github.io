---
status: draft
image: /images/blog/the-missing-test-suite/linkedin/verdict.png
comments:
  - text: |
      The full post, with the loop step by step, the approval rate it is meant to raise (and why that is not a saving), and which part of the review tool to build yourself: https://danielfridljand.de/post/the-missing-test-suite
    image: /images/blog/the-missing-test-suite/linkedin/review-screen.png
---
Coding agents made code cheap. On a support automation I built, that moved the bottleneck to the experts who could tell if a reply was right.

In code, tests and linters catch much of what can go wrong, and a coding agent gets their verdict on every attempt for free. A reply to a customer has nothing comparable: the only check is an expert who knows the business reading it.

Goldratt's theory of constraints says fixing a bottleneck doesn't remove it; it moves it somewhere else. Without a coding agent, the bottleneck would have been me, writing the code for every fix. The coding agent moved it. Once I knew what to fix, the fix took little of my time. The slow part became learning what to fix, and only the experts could tell me that.

The experts are also where the rules live. They can rarely list them up front, but shown a draft, they see at a glance what's wrong with it. One rejected draft, which asked a locked-out customer for details we already had, brought out two rules nobody had written down. So grading does two jobs: it's the check a coding agent gets from its tests, and it's how the rules get written down.

My own job was designing the system. It had to meet the requirements and split decisions between code and model the way I wanted. And it had to turn most expert feedback into a change in one place: a new kind of request for the system to recognise, or a new rule for one it already knew. A change like that I could describe in two sentences and trust a coding agent to build. For the locked-out customer, the fix and its eval case were done by the next morning.

I also designed the loop around the experts, to make grading easy for them, because their time was the constraint. They were the support staff answering those tickets anyway, so they graded each draft as they picked up its ticket, on a screen with the customer's message and the draft. An approved draft was a reply they didn't have to write. My follow-up questions waited next to the ticket instead of in direct messages, which is how one developer could work with ten experts.

Full post in the first comment.

#AIAgents #LLM #Evals #CustomerSupport
