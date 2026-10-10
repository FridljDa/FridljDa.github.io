---
status: draft
images:
  - /images/blog/the-missing-compiler/linkedin/review-screen.png
firstComment: |
  The full post, with the loop step by step, the other thing we waited on (endpoints from the client's IT) and where I expect the bottleneck to move next: https://danielfridljand.de/post/the-missing-compiler
---
Once a coding agent wrote our fixes overnight, our LLM support automation moved only as fast as domain experts could grade its replies.

A coding agent learns whether its code works on every attempt: tests, linters and the compiler tell it. A reply to a customer has no compiler. The only way to know whether it is right is for someone who knows the business to read it.

So the system went live in shadow mode: it drafted replies to real customer messages, experts graded them, and no customer saw any of them. Every fix went round the same loop:

1. An expert grades a draft and says what is wrong.
2. I steer the coding agent with a high-level plan for the fix.
3. A coding agent implements it overnight.
4. Evals and CI check it.

Steps 3 and 4 took little of my time. Step 1 set the pace. What I took from it:

→ Have the experts grade real drafts as early as possible. We waited until replays of old tickets looked good. The grading the experts could have done in those weeks never comes back, and an old ticket can't replay the customer's records as they were then.

→ Build the screen the experts grade in, and make each grade quick. I also built the storage behind it myself; I wouldn't again. Langfuse's annotation queues cover that part.

→ Grading is how the rules get written down. Experts can rarely list their rules up front, but shown one wrong reply, they say what is wrong. The expert's comment in the picture holds two rules nobody had written down.

If you estimate a project like this, the experts' availability is a hard input, not a detail to sort out later.

Full post in the first comment.

#AIAgents #LLM #Evals #CustomerSupport
