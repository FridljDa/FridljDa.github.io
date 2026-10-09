---
status: draft
images:
  - /images/blog/the-missing-compiler/linkedin/review-screen.png
firstComment: |
  The full post, with the feedback loop we built and what I would do differently: https://danielfridljand.de/post/the-missing-compiler
---
Coding agents made the code cheap. On our LLM support automation, that moved the bottleneck to the people who know the business.

A coding agent gets a verdict on every attempt for free: tests, linters, compiler errors. A business process has no compiler. The only verdict on a reply to a customer is someone who knows the bank reading it.

So once the code was cheap, the subject-matter experts' time limited everything. What I learned from it:

→ Get into shadow deployment early. Replaying historic tickets replays the message, not the state of the records at the time. Shadow was the only place the pipeline ran against real data.

→ Build the review screen, not the plumbing. Every click you remove from the experts' screen is time handed back to the bottleneck. Queues and score storage are not worth writing yourself.

→ Grading is how you get the rules written down. Experts rarely write the rules in advance, but shown one wrong reply, they name two rules nobody had documented.

→ Expect the bottleneck to move again. Once the experts graded steadily, the next one was me, translating their feedback into changes for the coding agent.

If you estimate a project like this, the reviewers' availability is a hard input, not a detail to sort out later.

#AI #LLM #CustomerSupport #AIEngineering
