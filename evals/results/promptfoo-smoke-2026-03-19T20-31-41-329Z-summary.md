# Promptfoo Summary

Result file: `R:\lore\evals\results\promptfoo-smoke-2026-03-19T20-31-41-329Z.json`

## [qwen3.5:9b] add-single-todo-explicit

Add a single explicit todo

Pass rate: 0/1 (0.0%)

Failure stages:
- 1x Step 1 @ No status emitted

Failure reasons:
- 1x Step 1: expected response to include "saved".
- 1x Step 1: expected 1 stored events but saw 0.
- 1x Step 1: expected 1 todos but found 0.

Failed check types:
- 1x responseIncludes
- 1x storedCount
- 1x todoCount

Sample failures:
    Sample failed checks:
      - responseIncludes: expected response to include "saved".
        expected: saved
        actual: 
      - storedCount: expected 1 stored events but saw 0.
        expected: 1
        actual: 0
      - todoCount: expected 1 todos but found 0.
        expected: 1
        actual: 0
    Attempted conversation:
      - user: Add to my todo list: buy milk
        assistant: 

## [qwen3.5:9b] add-multiple-todos-inline-list

Add multiple todos in one message

Pass rate: 0/1 (0.0%)

Failure stages:
- 1x Step 1 @ No status emitted

Failure reasons:
- 1x Step 1: expected response to include "saved 3 todos".
- 1x Step 1: expected 3 stored events but saw 0.
- 1x Step 1: expected 3 todos but found 0.

Failed check types:
- 3x todoContentsIncludeSubstrings
- 1x responseIncludes
- 1x storedCount

Sample failures:
    Sample failed checks:
      - responseIncludes: expected response to include "saved 3 todos".
        expected: saved 3 todos
        actual: 
      - storedCount: expected 3 stored events but saw 0.
        expected: 3
        actual: 0
      - todoCount: expected 3 todos but found 0.
        expected: 3
        actual: 0
    Attempted conversation:
      - user: Todos: buy milk, call mom, pay rent
        assistant: 

## [qwen3.5:9b] ambiguous-update-needs-clarification

Ambiguous update asks for clarification

Pass rate: 0/1 (0.0%)

Failure stages:
- 1x Step 1 @ No status emitted

Failure reasons:
- 1x Step 1: expected 2 stored events but saw 0.
- 1x Step 1: expected 2 todos but found 0.
- 1x Step 2: expected a clarification request in "Ambiguous update asks for clarification". Judge: The assistant failed to ask the user to disambiguate due to an internal technical error ('Embedding failed (404)'). Instead of clarifying the ambiguous request (editing water to fire), the system simply returned an error message and stopped. The rubric requires the assistant to clearly ask the user for clarification before taking action, but the action was aborted by a system failure rather than a clarification request.

Failed check types:
- 2x todoCount
- 2x todoContentsIncludeExact
- 1x storedCount

Sample failures:
    Sample failed checks:
      - storedCount: expected 2 stored events but saw 0.
        expected: 2
        actual: 0
      - todoCount: expected 2 todos but found 0.
        expected: 2
        actual: 0
      - requiresClarification: expected a clarification request in "Ambiguous update asks for clarification". Judge: The assistant failed to ask the user to disambiguate due to an internal technical error ('Embedding failed (404)'). Instead of clarifying the ambiguous request (editing water to fire), the system simply returned an error message and stopped. The rubric requires the assistant to clearly ask the user for clarification before taking action, but the action was aborted by a system failure rather than a clarification request.
        expected: true
        actual: 
    Attempted conversation:
      - user: Todos: jump on the water, drink the water
        assistant: 

## [qwen3.5:9b] delete-specific-todo

Delete one matching todo

Pass rate: 0/1 (0.0%)

Failure stages:
- 1x Step 1 @ No status emitted

Failure reasons:
- 1x Step 1: expected 2 stored events but saw 0.
- 1x Step 1: expected 2 todos but found 0.
- 1x Step 2: expected 1 deleted events but saw 0.

Failed check types:
- 2x todoCount
- 1x storedCount
- 1x deletedCount

Sample failures:
    Sample failed checks:
      - storedCount: expected 2 stored events but saw 0.
        expected: 2
        actual: 0
      - todoCount: expected 2 todos but found 0.
        expected: 2
        actual: 0
      - deletedCount: expected 1 deleted events but saw 0.
        expected: 1
        actual: 0
    Attempted conversation:
      - user: Todos: buy milk, buy bread
        assistant: 

## [qwen3.5:9b] greeting-then-add-todo

Greeting before task creation

Pass rate: 0/1 (0.0%)

Failure stages:
- 1x Step 2 @ No status emitted

Failure reasons:
- 1x Step 2: expected 1 stored events but saw 0.
- 1x Step 2: expected 1 todos but found 0.
- 1x Step 2: expected a todo containing "stretch for ten minutes".

Failed check types:
- 1x storedCount
- 1x todoCount
- 1x todoContentsIncludeSubstrings

Sample failures:
    Sample failed checks:
      - storedCount: expected 1 stored events but saw 0.
        expected: 1
        actual: 0
      - todoCount: expected 1 todos but found 0.
        expected: 1
        actual: 0
      - todoContentsIncludeSubstrings: expected a todo containing "stretch for ten minutes".
        expected: stretch for ten minutes
        actual: []
    Attempted conversation:
      - user: Nice. Add to my todo list: stretch for ten minutes
        assistant: 

## [qwen3.5:9b] retrieve-todos-after-creation

Retrieve todos after creating them

Pass rate: 0/1 (0.0%)

Failure stages:
- 1x Step 1 @ No status emitted

Failure reasons:
- 1x Step 1: expected 2 stored events but saw 0.
- 1x Step 1: expected 2 todos but found 0.
- 1x Step 2: expected response to include "buy milk".

Failed check types:
- 2x todoCount
- 2x responseIncludes
- 1x storedCount

Sample failures:
    Sample failed checks:
      - storedCount: expected 2 stored events but saw 0.
        expected: 2
        actual: 0
      - todoCount: expected 2 todos but found 0.
        expected: 2
        actual: 0
      - responseIncludes: expected response to include "buy milk".
        expected: buy milk
        actual: 
    Attempted conversation:
      - user: Todos: buy milk, call mom
        assistant: 

## [qwen3.5:9b] update-specific-todo

Update a specific todo by description

Pass rate: 0/1 (0.0%)

Failure stages:
- 1x Step 1 @ No status emitted

Failure reasons:
- 1x Step 1: expected 2 stored events but saw 0.
- 1x Step 1: expected 2 todos but found 0.
- 1x Step 2: expected 2 todos but found 0.

Failed check types:
- 2x todoCount
- 2x todoContentsIncludeSubstrings
- 1x storedCount

Sample failures:
    Sample failed checks:
      - storedCount: expected 2 stored events but saw 0.
        expected: 2
        actual: 0
      - todoCount: expected 2 todos but found 0.
        expected: 2
        actual: 0
      - todoCount: expected 2 todos but found 0.
        expected: 2
        actual: 0
    Attempted conversation:
      - user: Todos: buy milk, call mom
        assistant: 

## [qwen3.5:9b] low-confidence-vague-request

Vague request does not mutate state

Pass rate: 0/1 (0.0%)

Failure stages:
- 1x Step 1 @ No status emitted

Failure reasons:
- 1x Step 1: expected response to include "not sure".

Failed check types:
- 1x responseIncludes

Sample failures:
    Sample failed checks:
      - responseIncludes: expected response to include "not sure".
        expected: not sure
        actual: Hey there! 👋 It sounds like you're looking to get started. I'm Lore, and I'm here to help you organize your thoughts.

I can:
*   Save **notes**, **ideas**, and **reminders**
*...
    Attempted conversation:
      - user: Do the thing
        assistant: Hey there! 👋 It sounds like you're looking to get started. I'm Lore, and I'm here to help you organize your thoughts.

I can:
*   Save **notes**, **ideas**, and **reminders**
*...
