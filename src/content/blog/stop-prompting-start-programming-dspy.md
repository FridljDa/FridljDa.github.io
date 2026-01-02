---
title: "Stop Prompting, Start Programming with DSPy"
pubDate: 2026-01-02
tags:
  - AI
description: "DSPy is a framework that separates the 'what' from the 'how' in LLM development, moving from brittle prompt engineering to robust software engineering."
image: /images/blog/stop-prompting-start-programming-dspy/infographic.png
math: false
---

After reading about [DSPy](https://dspy.ai/) in [Pedram Navid's excellent blog post](https://pedramnavid.com/blog/dspy-part-one/), I decided to write a more minimalistic blog post to demonstrate the capabilities. I went with a simple example use case for Sentiment Analysis with Reasoning.

The Goal: Take a movie review, determine if it is `Positive` or `Negative`, and extract a short reason why.

## The "Without DSPy" Approach (The Old Way)

In this approach, your application logic is tightly coupled with a specific, brittle prompt string. You have to manually manage the API, handle formatting instructions, and parse the raw text output.
```python
# --- THE OLD WAY ---
import openai
import json

# 1. The Brittle Prompt String
# If you change a word here, you might break the JSON parser later.
PROMPT_TEMPLATE = """
Analyze the sentiment of the following movie review.
Return ONLY a JSON object with keys: "sentiment" and "reason".
The sentiment must be exactly "Positive" or "Negative".
Do not include markdown formatting like ```json at the start or end.

Review: "{review_text}"
"""

def analyze_review_manual(review_text):
    # 2. Manually construct the prompt
    prompt = PROMPT_TEMPLATE.format(review_text=review_text)

    # 3. Call the API
    client = openai.Client()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    raw_content = response.choices[0].message.content
    
    # 4. The "Hope and Pray" Parsing Step
    try:
        # We often need hacky cleanup code here just in case
        cleaned_content = raw_content.strip().replace("```json", "").replace("```", "")
        data = json.loads(cleaned_content)
        return data["sentiment"], data["reason"]
    except (json.JSONDecodeError, KeyError):
        # This happens way too often
        return "Error", "LLM failed to follow JSON instructions"

# Usage
s, r = analyze_review_manual("The visuals were stunning, but the story put me to sleep.")
print(f"Sentiment: {s}\nReason: {r}")
```

**Pain Points:**

* **Brittle Prompts:** You have to write "Return ONLY JSON" and "The sentiment must be..."
* **Parsing Logic:** You need extra code (`json.loads`, string replacement) to handle the output.
* **Hard to Tune:** If you want to improve accuracy, you have to rewrite the English sentences in the `prompt` variable.


## The "With DSPy" Approach

In DSPy, you define the *structure* (Input/Output) and let the framework handle the prompt creation and parsing.

```python
import dspy

# Configure the LM once
lm = dspy.LM("openai/gpt-4o")
dspy.configure(lm=lm)

# 1. Define the "Signature" (The Interface)
class MovieSentiment(dspy.Signature):
    """Classify the sentiment of a movie review and explain why."""
    review_text = dspy.InputField()
    sentiment = dspy.OutputField(desc="Positive or Negative")
    reason = dspy.OutputField(desc="A short explanation")

# 2. Define the Module (The Strategy)
# ChainOfThought automatically adds "Let's think step by step" logic
analyzer = dspy.ChainOfThought(MovieSentiment)

# 3. Run it
result = analyzer(review_text="The visuals were stunning, but the story put me to sleep.")

# Access attributes directly (No parsing needed)
print(f"Sentiment: {result.sentiment}")
print(f"Reason: {result.reason}")

```

### What the Compiled Prompt Looks Like

If you look at the DSPy example, you'll notice what's missing: **The prompt.**

DSPy automatically generated the prompt in the background based on the MovieSentiment class structure. 

For our `MovieSentiment` example with `ChainOfThought`, DSPy generates a prompt that looks something like this:

```
Classify the sentiment of a movie review and explain why.

Review: {review_text}

Let's think step by step.

Sentiment: Positive or Negative
Reason: A short explanation
```

**How DSPy constructs this:**

1. **Task description**: Taken from the signature's docstring (`"""Classify the sentiment of a movie review and explain why."""`)

2. **Input fields**: Each `InputField` becomes a labeled section in the prompt. The field name (`review_text`) is used as the label.

3. **ChainOfThought injection**: The `ChainOfThought` module automatically adds "Let's think step by step." to encourage reasoning.

4. **Output fields**: Each `OutputField` becomes a labeled section with its description. The `desc` parameter (`"Positive or Negative"` and `"A short explanation"`) guides the model on what to produce.

5. **Model-specific formatting**: DSPy adapts this structure to match the chat template of your chosen LM (GPT-4, Claude, Llama, etc.) automatically.

The actual prompt sent to the API is more structured and includes system messages, but this shows the core content. The key insight is that DSPy derives all of this from your declarative signature—you never write these instructions manually.

### Why this is a game changer

### 1. Modularity

Want to change your strategy from a simple prediction to a complex "Reason-Act" loop that can search Wikipedia first? In the old way, you rewrite your entire prompt. In DSPy, you just change one line:

```python
analyzer = dspy.ReAct(MovieSentiment, tools=[...])
```

### 2. Model Agnosticism

Moving from GPT-4 to a locally hosted Llama-3 model often requires completely rewriting prompts to match different chat templates. DSPy handles this translation layer dynamically at runtime. You rarely touch your application code.

### 3. Prompt Optimization
Let's say your sentiment analyzer isn't accurate enough. In the "old world," you would spend hours manually rewriting the prompt, relying on intuition to try different few-shot examples.

DSPy provides several Optimizers to tune the prompt systematically. This is analogous to hyperparameters in deep learning. While tuning used to be driven by trial-and-error and "gut feeling," optimizers have since turned it into a data science problem that can be solved systematically.

To use a DSPy optimizer, you need three things:

- A Dataset: A list of inputs and expected outputs (e.g., 20 examples of movie reviews and their correct labels).

- A Metric: A function that defines success (e.g., correct_sentiment which returns True if the prediction matches the label).

- An Optimizer: A strategy module like BootstrapFewShotWithRandomSearch (or BootstrapRS).

Here is how you "compile" your AI program:

```python
from dspy.teleprompt import BootstrapFewShotWithRandomSearch

# 1. Define the Metric
def validate_sentiment(example, prediction, trace=None):
    return example.sentiment == prediction.sentiment

# 2. Initialize the Optimizer
# This is like defining a training loop in PyTorch
optimizer = BootstrapFewShotWithRandomSearch(
    metric=validate_sentiment,
    max_bootstrapped_demos=4,
    num_candidate_programs=10
)

# 3. Compile!
# DSPy now acts as an automated prompt engineer
compiled_analyzer = optimizer.compile(analyzer, trainset=my_dataset)
```
What happens during compile()?

The optimizer runs an automated experiment. For BootstrapRS, specifically:

- Teacher Generation: It uses a "teacher" model (which can be the same as your student model) to generate reasoning traces for your training examples.

- Filtering: It keeps only the traces that lead to the correct answer according to your metric.

- Optimization: It performs a random search over these generated demonstrations to find the optimal combination that maximizes accuracy on your validation set.

The result is a compiled_analyzer that looks just like your original object, but contains a highly optimized prompt with the best possible few-shot examples and reasoning steps—all discovered without you writing a single word of instruction.
