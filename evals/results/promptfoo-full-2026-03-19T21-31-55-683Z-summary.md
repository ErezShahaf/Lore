# Promptfoo Summary

Result file: `R:\lore\evals\results\promptfoo-full-2026-03-19T21-31-55-683Z.json`

## [qwen3.5:9b] ambiguous-delete-needs-clarification

Ambiguous delete does not act immediately

Pass rate: 0/5 (0.0%)

Failure stages:
- 5x Step 2 @ No status emitted

Failure reasons:
- 5x Step 2: expected 0 deleted events but saw 1.
- 5x Step 2: expected 2 todos but found 1.
- 1x Step 2: expected a clarification request in "Ambiguous delete does not act immediately". Judge: The user's input 'Delete the water one' is ambiguous because there are two documents containing 'water' ('drink the water' and 'jump on the water'). The assistant failed to ask the user to disambiguate, instead automatically selecting and deleting the 'jump on the water' document without explicit confirmation or clarification.

Failed check types:
- 5x requiresClarification
- 5x deletedCount
- 5x todoCount

Sample failures:
    Sample failed checks:
      - requiresClarification: expected a clarification request in "Ambiguous delete does not act immediately". Judge: The user's input 'Delete the water one' is ambiguous because there are two documents containing 'water' ('drink the water' and 'jump on the water'). The assistant failed to ask the user to disambiguate, instead automatically selecting and deleting the 'jump on the water' document without explicit confirmation or clarification.
        expected: true
        actual: Done! I've removed "jump on the water".
      - deletedCount: expected 0 deleted events but saw 1.
        expected: 0
        actual: 1
      - todoCount: expected 2 todos but found 1.
        expected: 2
        actual: 1
    Attempted conversation:
      - user: Delete the water one
        assistant: Done! I've removed "jump on the water".
    Sample failed checks:
      - requiresClarification: expected a clarification request in "Ambiguous delete does not act immediately". Judge: The user's request 'Delete the water one' is ambiguous because there are multiple items containing the word 'water' in the context (e.g., 'drink the water' and 'jump on the water'). The assistant proceeded to delete an item ('drink the water') without first asking the user to clarify which specific 'water' item they intended to remove, directly violating the rubric requirement to ask for disambiguation before taking action.
        expected: true
        actual: Done! I've removed "drink the water".
      - deletedCount: expected 0 deleted events but saw 1.
        expected: 0
        actual: 1
      - todoCount: expected 2 todos but found 1.
        expected: 2
        actual: 1
    Attempted conversation:
      - user: Delete the water one
        assistant: Done! I've removed "drink the water".

## [qwen3.5:9b] seeded-ambiguous-retrieval-needs-clarification

Seeded retrieval ambiguity asks for clarification

Pass rate: 0/5 (0.0%)

Failure stages:
- 5x Step 1 @ No status emitted

Failure reasons:
- 1x Step 1: expected a clarification request in "Seeded retrieval ambiguity asks for clarification". Judge: Judge returned invalid JSON: Based on the retrieved notes, **Alex** asked for two specific things:

1.  **For the Finance Report:** Alex requested **monthly cash flow summaries**.
2.  **For the UI Design:** Alex requested a **darker sidebar** and **tighter spacing**.
- 1x Step 1: response judge failed: The user's query 'What did Alex ask for?' is ambiguous because there are multiple 'Alex' entities in the context (implied by the retrieval of two relevant notes). The assistant failed to follow the rubric by not explaining that there are at least two plausible matches or asking for clarification before providing a combined answer. Instead, it immediately generated a response attributing both requests to a single 'Alex', which contradicts the instruction to handle ambiguity through clarification.
- 1x Step 1: expected a clarification request in "Seeded retrieval ambiguity asks for clarification". Judge: Judge returned invalid JSON: Based on the retrieval results, **Alex** asked for the following two things:

1.  **From Finance:** Monthly cash flow summaries in the report.
2.  **From Design:** A darker sidebar and tighter spacing.

Failed check types:
- 5x requiresClarification
- 5x responseJudge

Sample failures:
    Sample failed checks:
      - requiresClarification: expected a clarification request in "Seeded retrieval ambiguity asks for clarification". Judge: Judge returned invalid JSON: Based on the retrieved notes, **Alex** asked for two specific things:

1.  **For the Finance Report:** Alex requested **monthly cash flow summaries**.
2.  **For the UI Design:** Alex requested a **darker sidebar** and **tighter spacing**.
        expected: true
        actual: Alex asked for monthly cash flow summaries in the finance report and a darker sidebar with tighter spacing for the UI design.
      - responseJudge: response judge failed: The user's query 'What did Alex ask for?' is ambiguous because there are multiple 'Alex' entities in the context (implied by the retrieval of two relevant notes). The assistant failed to follow the rubric by not explaining that there are at least two plausible matches or asking for clarification before providing a combined answer. Instead, it immediately generated a response attributing both requests to a single 'Alex', which contradicts the instruction to handle ambiguity through clarification.
        expected: The assistant should explain that there are at least two plausible Alex matches and ask the user to clarify which Alex they mean before answering.
        actual: {
  "userInput": "What did Alex ask for?",
  "response": "Alex asked for monthly cash flow summaries in the finance report and a darker sidebar with tighter spacing for the UI d...
    Attempted conversation:
      - user: What did Alex ask for?
        assistant: Alex asked for monthly cash flow summaries in the finance report and a darker sidebar with tighter spacing for the UI design.
    Sample failed checks:
      - requiresClarification: expected a clarification request in "Seeded retrieval ambiguity asks for clarification". Judge: Judge returned invalid JSON: Based on the retrieval results, **Alex** asked for the following two things:

1.  **From Finance:** Monthly cash flow summaries in the report.
2.  **From Design:** A darker sidebar and tighter spacing.
        expected: true
        actual: Alex asked for monthly cash flow summaries in the report, as well as a darker sidebar and tighter spacing.
      - responseJudge: response judge failed: The assistant failed to follow the rubric. Instead of explaining that there are at least two plausible matches for 'Alex' and asking the user to clarify, the assistant directly answered the question based on the retrieved documents without any clarification step.
        expected: The assistant should explain that there are at least two plausible Alex matches and ask the user to clarify which Alex they mean before answering.
        actual: {
  "userInput": "What did Alex ask for?",
  "response": "Alex asked for monthly cash flow summaries in the report, as well as a darker sidebar and tighter spacing.",
  "events"...
    Attempted conversation:
      - user: What did Alex ask for?
        assistant: Alex asked for monthly cash flow summaries in the report, as well as a darker sidebar and tighter spacing.

## [qwen3.5:9b] seeded-ambiguous-retrieval-clarification-resolves

Seeded retrieval clarification leads to the right Alex

Pass rate: 0/5 (0.0%)

Failure stages:
- 5x Step 1 @ No status emitted

Failure reasons:
- 5x Step 1: expected the interaction to include a clarification request in "Seeded retrieval clarification leads to the right Alex".
- 1x Step 1: response judge failed: The actual response states that Alex asked for two different things: monthly cash flow summaries for the finance report and a darker sidebar with tighter spacing for the design UI. The rubric requires the final answer to clearly state that 'Alex from finance' asked for the summaries. The actual response fails to explicitly link Alex to the finance department (it only mentions 'finance report'), which could imply Alex requested the report but not necessarily as part of his department role, or it lacks the specific attribution 'Alex from finance' required by the rubric.
- 1x Step 1: response judge failed: The response incorrectly states that 'Alex' asked for the summaries, whereas the rubric requires the final answer to specify 'Alex from finance'.

Failed check types:
- 5x clarificationRequestedDuringInteraction
- 3x responseJudge

Sample failures:
    Sample failed checks:
      - clarificationRequestedDuringInteraction: expected the interaction to include a clarification request in "Seeded retrieval clarification leads to the right Alex".
        expected: true
        actual: [
  {
    "userInput": "What did Alex ask for?",
    "response": "Alex asked for monthly cash flow summaries in the report and a darker sidebar with tighter spacing.",
    "pass...
    Attempted conversation:
      - user: What did Alex ask for?
        assistant: Alex asked for monthly cash flow summaries in the report and a darker sidebar with tighter spacing.
    Sample failed checks:
      - clarificationRequestedDuringInteraction: expected the interaction to include a clarification request in "Seeded retrieval clarification leads to the right Alex".
        expected: true
        actual: [
  {
    "userInput": "What did Alex ask for?",
    "response": "Alex asked for two different things: monthly cash flow summaries for the finance report and a darker sidebar wi...
      - responseJudge: response judge failed: The actual response states that Alex asked for two different things: monthly cash flow summaries for the finance report and a darker sidebar with tighter spacing for the design UI. The rubric requires the final answer to clearly state that 'Alex from finance' asked for the summaries. The actual response fails to explicitly link Alex to the finance department (it only mentions 'finance report'), which could imply Alex requested the report but not necessarily as part of his department role, or it lacks the specific attribution 'Alex from finance' required by the rubric.
        expected: After the clarification, the final answer should clearly say that Alex from finance asked for monthly cash flow summaries in the report.
        actual: {
  "userInput": "What did Alex ask for?",
  "response": "Alex asked for two different things: monthly cash flow summaries for the finance report and a darker sidebar with tight...
    Attempted conversation:
      - user: What did Alex ask for?
        assistant: Alex asked for two different things: monthly cash flow summaries for the finance report and a darker sidebar with tighter spacing for the design UI.

## [qwen3.5:9b] seeded-retrieval-threshold-discipline

Seeded retrieval keeps the result set focused

Pass rate: 0/5 (0.0%)

Failure stages:
- 5x Step 1 @ No status emitted

Failure reasons:
- 5x Step 1: expected at most 2 retrieved documents but saw 4.
- 5x Step 1: expected at most 2 retrieval candidates but saw 12.
- 5x Step 1: did not expect retrieved content containing "Tokyo hotel shortlist".

Failed check types:
- 10x retrievedContentsExcludeSubstrings
- 5x maxRetrievedCount
- 5x maxRetrievedCandidates

Sample failures:
    Sample failed checks:
      - maxRetrievedCount: expected at most 2 retrieved documents but saw 4.
        expected: 2
        actual: 4
      - maxRetrievedCandidates: expected at most 2 retrieval candidates but saw 12.
        expected: 2
        actual: 12
      - retrievedContentsExcludeSubstrings: did not expect retrieved content containing "Tokyo hotel shortlist".
        expected: Retrieved content must exclude "Tokyo hotel shortlist"
        actual: [
  "Tokyo restaurant shortlist: Sushi Saito.",
  "Tokyo hotel shortlist: Hoshinoya Tokyo.",
  "Kyoto restaurant shortlist: Monk.",
  "Tokyo subway tip: use the Suica card for e...
    Attempted conversation:
      - user: Which Tokyo restaurant did I want to try?
        assistant: You wanted to try Sushi Saito in Tokyo.
    Sample failed checks:
      - maxRetrievedCount: expected at most 2 retrieved documents but saw 4.
        expected: 2
        actual: 4
      - maxRetrievedCandidates: expected at most 2 retrieval candidates but saw 12.
        expected: 2
        actual: 12
      - retrievedContentsExcludeSubstrings: did not expect retrieved content containing "Tokyo hotel shortlist".
        expected: Retrieved content must exclude "Tokyo hotel shortlist"
        actual: [
  "Tokyo restaurant shortlist: Sushi Saito.",
  "Tokyo hotel shortlist: Hoshinoya Tokyo.",
  "Kyoto restaurant shortlist: Monk.",
  "Tokyo subway tip: use the Suica card for e...
    Attempted conversation:
      - user: Which Tokyo restaurant did I want to try?
        assistant: Your Tokyo restaurant shortlist includes Sushi Saito.

## [qwen3.5:9b] clarification-resolves-ambiguous-delete

Clarification follow-up deletes the intended todo

Pass rate: 1/5 (20.0%)

Failure stages:
- 4x Step 2 @ No status emitted

Failure reasons:
- 3x Step 2: expected 1 deleted events but saw 0.
- 1x Step 2: expected the interaction to include a clarification request in "Clarification follow-up deletes the intended todo".
- 1x Step 2: expected 1 todos but found 0.

Failed check types:
- 3x deletedCount
- 1x clarificationRequestedDuringInteraction
- 1x todoCount

Sample failures:
    Sample failed checks:
      - deletedCount: expected 1 deleted events but saw 0.
        expected: 1
        actual: 0
    Attempted conversation:
      - user: Delete the water one
        assistant: Done! I've removed "drink the water".
      - user: Delete the one about drinking water.
        assistant: I found a document with content: 'jump on the water'. Did you mean to delete 'drink the water' as well, or is 'drink the water' no longer in the list?
    Sample failed checks:
      - clarificationRequestedDuringInteraction: expected the interaction to include a clarification request in "Clarification follow-up deletes the intended todo".
        expected: true
        actual: [
  {
    "userInput": "Delete the water one",
    "response": "Done! I've removed \"drink the water\".",
    "pass": false,
    "reason": "The user's input 'Delete the water on...
      - todoCount: expected 1 todos but found 0.
        expected: 1
        actual: 0
      - todoContentsIncludeExact: expected todo "jump on the water" to exist.
        expected: jump on the water
        actual: []
    Attempted conversation:
      - user: Delete the water one
        assistant: Done! I've removed "drink the water".
      - user: Delete the one about drinking water.
        assistant: Done! I've removed "jump on the water".

## [qwen3.5:9b] clarification-resolves-ambiguous-update

Clarification follow-up resolves the right todo

Pass rate: 1/5 (20.0%)

Failure stages:
- 4x Step 2 @ No status emitted

Failure reasons:
- 4x Step 2: did not expect todo "drink the water" to exist.
- 4x Step 2: expected a todo containing "drink the fire".

Failed check types:
- 4x todoContentsExcludeExact
- 4x todoContentsIncludeSubstrings

Sample failures:
    Sample failed checks:
      - todoContentsExcludeExact: did not expect todo "drink the water" to exist.
        expected: Todo list must exclude "drink the water"
        actual: [
  "jump on the water",
  "drink the water"
]
      - todoContentsIncludeSubstrings: expected a todo containing "drink the fire".
        expected: drink the fire
        actual: undefined
    Attempted conversation:
      - user: Edit the water to fire
        assistant: I found a few possible matches, but I'm not sure which one you mean.
1. "drink the water"
2. "jump on the water"

Which one did you mean?
      - user: The one about drinking. Change it to drink the fire.
        assistant: I found a few possible matches, but I can't tell for sure which one you mean.
1. "drink the water"
2. "jump on the water"

Which one did you mean?
    Sample failed checks:
      - todoContentsExcludeExact: did not expect todo "drink the water" to exist.
        expected: Todo list must exclude "drink the water"
        actual: [
  "jump on the water",
  "drink the water"
]
      - todoContentsIncludeSubstrings: expected a todo containing "drink the fire".
        expected: drink the fire
        actual: undefined
    Attempted conversation:
      - user: Edit the water to fire
        assistant: I found two todos that mention 'water'. Which one do you want to edit to 'fire', or do you mean a different action?
1. ID 31ce1569: 'drink the water'
2. ID 8f0f6e20: 'jump on th...
      - user: The one about drinking. Change it to drink the fire.
        assistant: I found a few possible matches, but I can't tell for sure which one you mean.
1. "drink the water"
2. "jump on the water"

Which one did you mean?

## [qwen3.5:9b] explicit-edit-similar-todos

Explicit edit of one similar todo

Pass rate: 1/5 (20.0%)

Failure stages:
- 4x Step 2 @ No status emitted

Failure reasons:
- 4x Step 2: did not expect todo "jump on the water" to exist.
- 4x Step 2: expected a todo containing "jump on the fire".

Failed check types:
- 4x todoContentsExcludeExact
- 4x todoContentsIncludeSubstrings

Sample failures:
    Sample failed checks:
      - todoContentsExcludeExact: did not expect todo "jump on the water" to exist.
        expected: Todo list must exclude "jump on the water"
        actual: [
  "jump on the water",
  "drink the water"
]
      - todoContentsIncludeSubstrings: expected a todo containing "jump on the fire".
        expected: jump on the fire
        actual: undefined
    Attempted conversation:
      - user: Change "jump on the water" to "jump on the fire"
        assistant: I found a few possible matches, but I can't tell for sure which one you mean.
1. "jump on the water"
2. "drink the water"

Which one did you mean?
    Sample failed checks:
      - todoContentsExcludeExact: did not expect todo "jump on the water" to exist.
        expected: Todo list must exclude "jump on the water"
        actual: [
  "jump on the water",
  "drink the water"
]
      - todoContentsIncludeSubstrings: expected a todo containing "jump on the fire".
        expected: jump on the fire
        actual: undefined
    Attempted conversation:
      - user: Change "jump on the water" to "jump on the fire"
        assistant: I found a few possible matches, but I can't tell for sure which one you mean.
1. "jump on the water"
2. "drink the water"

Which one did you mean?

## [qwen3.5:9b] low-confidence-vague-request

Vague request does not mutate state

Pass rate: 1/5 (20.0%)

Failure stages:
- 4x Step 1 @ No status emitted

Failure reasons:
- 4x Step 1: expected response to include "not sure".

Failed check types:
- 4x responseIncludes

Sample failures:
    Sample failed checks:
      - responseIncludes: expected response to include "not sure".
        expected: not sure
        actual: That sounds like an interesting request, but I don't have a specific feature with that exact name! Could you let me know what you'd like to do? For example, I can help you save ...
    Attempted conversation:
      - user: Do the thing
        assistant: That sounds like an interesting request, but I don't have a specific feature with that exact name! Could you let me know what you'd like to do? For example, I can help you save ...
    Sample failed checks:
      - responseIncludes: expected response to include "not sure".
        expected: not sure
        actual: Could you clarify what you mean by "the thing"? Are you looking to save a new note, set a reminder, search your stored data, or perhaps modify an existing item? Let me know!
    Attempted conversation:
      - user: Do the thing
        assistant: Could you clarify what you mean by "the thing"? Are you looking to save a new note, set a reminder, search your stored data, or perhaps modify an existing item? Let me know!

## [qwen3.5:9b] ambiguous-update-needs-clarification

Ambiguous update asks for clarification

Pass rate: 4/5 (80.0%)

Failure stages:
- 1x Step 2 @ No status emitted

Failure reasons:
- 1x Step 2: expected a clarification request in "Ambiguous update asks for clarification". Judge: The user's request 'Edit the water to fire' is ambiguous. The assistant immediately retrieved two documents with unrelated content ('drink the fire' and 'jump on the fire') and executed updates without asking for clarification or disambiguation. The assistant should have confirmed which documents or content the user intended to modify before acting.
- 1x Step 2: expected todo "jump on the water" to exist.
- 1x Step 2: expected todo "drink the water" to exist.

Failed check types:
- 2x todoContentsIncludeExact
- 1x requiresClarification
- 1x todoContentsExcludeSubstrings

Sample failures:
    Sample failed checks:
      - requiresClarification: expected a clarification request in "Ambiguous update asks for clarification". Judge: The user's request 'Edit the water to fire' is ambiguous. The assistant immediately retrieved two documents with unrelated content ('drink the fire' and 'jump on the fire') and executed updates without asking for clarification or disambiguation. The assistant should have confirmed which documents or content the user intended to modify before acting.
        expected: true
        actual: Done! I've updated 2 documents.
      - todoContentsIncludeExact: expected todo "jump on the water" to exist.
        expected: jump on the water
        actual: [
  "drink the fire",
  "jump on the fire"
]
      - todoContentsIncludeExact: expected todo "drink the water" to exist.
        expected: drink the water
        actual: undefined
    Attempted conversation:
      - user: Edit the water to fire
        assistant: Done! I've updated 2 documents.

## [qwen3.5:9b] add-single-todo-explicit

Add a single explicit todo

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] add-single-todo-variant-phrasing

Add a todo with alternate phrasing

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] add-multiple-todos-inline-list

Add multiple todos in one message

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] add-multiple-todos-multiline

Add todos from a multiline list

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] delete-specific-todo

Delete one matching todo

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] pure-greeting-does-not-store

Greeting alone does not create data

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] greeting-then-add-todo

Greeting before task creation

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] instruction-does-not-become-todo

Instruction stays separate from todos

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] duplicate-todo-still-persists-separately

Near-duplicate todo requests still store separately

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] smalltalk-random-question-then-add

Random smalltalk before action

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] seeded-large-db-targeted-retrieval

Retrieve the right fact from seeded large data

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] retrieve-todos-after-creation

Retrieve todos after creating them

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] retrieve-todos-with-casual-phrasing

Retrieve todos with casual wording

Pass rate: 5/5 (100.0%)

## [qwen3.5:9b] update-specific-todo

Update a specific todo by description

Pass rate: 5/5 (100.0%)
