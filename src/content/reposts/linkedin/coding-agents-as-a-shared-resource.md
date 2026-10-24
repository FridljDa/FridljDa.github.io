---
status: draft
image: /images/blog/coding-agents-as-a-shared-resource/featured.png
comments:
  - text: |
      The full post, with links to Entire and HumanLayer: https://danielfridljand.de/post/coding-agents-as-a-shared-resource

      I wrote about reviewing from the agent session in On the Future of Pull Requests: https://danielfridljand.de/post/future-of-pull-requests
---
Coding agents could be a shared resource, with the conversation visible to the team rather than private to one developer. I think that would fix more than one thing.

In their post on code review, the Claude Code team mention this almost in passing:
"Our culture of defaulting to working on open Slack channels helps too, since you see what others are building while they build it."

What a shared conversation would help with:
1. Collaboration. Someone who doesn't write code is never going to clone a repo and run a coding agent. They can join a conversation, though: add a requirement, correct a misunderstanding, or steer the work in plain language, while it happens rather than after a PR is up. Between developers, too, a shared conversation is easier to pick up than someone else's branch. Everyone could contribute.

2. Ownership of PRs. An AI-written PR can leave the reviewer wondering how much thought went into it, and whether the thinking is being handed to them. If everyone can see the prompt, authors take more ownership of the result, and low-effort PRs become less likely.

3. Intent. What did the author actually ask the agent for? I would rather not reconstruct that from a diff. Entire addresses part of this by saving the agent session alongside each commit.

4. Review comments. When I leave a suggestion on a PR, the author often pastes it into their coding agent. That is a detour; I would rather add it to the agent conversation directly.

5. Learning from others. When a colleague clearly knows their stuff, I'd like to see how they prompt their agent.

6. Visibility into token spend. If the conversations are shared, so is what they cost.

The obvious downside: most people would feel uneasy sharing their AI conversations with everyone.

The simplest version might just be Slack, where the Claude Code team already works in the open: everyone is there, and the integration exists. HumanLayer could be an interesting alternative.

#AgenticCoding #CodeReview #SoftwareEngineering #AI
