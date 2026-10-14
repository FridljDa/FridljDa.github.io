---
status: draft
images:
  - /images/blog/the-missing-test-suite/linkedin/verdict.png
  - /images/blog/the-missing-test-suite/linkedin/review-screen.png
firstComment: |
  The full post, with the loop step by step, the approval rate it is meant to raise (and why that is not a saving), and which part of the review tool to build yourself: https://danielfridljand.de/post/the-missing-test-suite
---
A coding agent turned each fix I planned into a green build overnight, and it took little of my time. Finding out what to fix was the slow part, because a reply to a customer has no test suite.

Tests and linters give a coding agent a verdict on every attempt. The system I built drafts replies to support tickets, and the only check on a reply is an expert reading it, so their time set the pace.

Experts can rarely list the rules up front, but shown a draft, they see at a glance what's wrong with it. In the second picture, a customer gives their account number and says the account is locked, and the draft asks for their email address. The expert's comment states two rules nobody had written down: never ask for what we can find, and locked accounts get the unlock link, or go to security if flagged. Below it is my plan for the fix; the coding agent picks it up in its nightly run.

The agent also adds the case to the eval set, and CI goes green. That only shows the code matches my plan. The fix counts once an expert approves a new reply to the same ticket.

I waited too long to show the experts drafts for live tickets, even though a draft only reached a customer if one of them approved and sent it. I wanted acceptable numbers on old tickets first, and until then they saw a handful of replies I demoed each week. Those were weeks of grades we never got. Replaying old tickets catches regressions, but it's a poor way to find out what a good reply looks like.

When you estimate a project like this, budget the experts' time. Ours were the support staff who answered those tickets anyway. They graded each draft when they picked up its ticket, and an approved one was a reply they didn't have to write. A rejected one was still one more task in a full day, for people who may suspect they're training their replacement. We were lucky that they engaged and that the client's leadership visibly backed the work. That kept the feedback coming and useful, and you can't count on either.

So make each grade quick to give, and keep the conversation in the review tool. I asked my questions there, next to the ticket, and the experts answered when they got to it. That is how one developer could work with ten of them without anyone sending a direct message.

Full post in the first comment.

#AIAgents #LLM #Evals #CustomerSupport
