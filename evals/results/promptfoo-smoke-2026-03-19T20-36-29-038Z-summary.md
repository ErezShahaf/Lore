# Promptfoo Summary

Result file: `R:\lore\evals\results\promptfoo-smoke-2026-03-19T20-36-29-038Z.json`

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
        actual: Got it! I'll remember that from now on.
    Attempted conversation:
      - user: Do the thing
        assistant: Got it! I'll remember that from now on.

## [qwen3.5:9b] add-single-todo-explicit

Add a single explicit todo

Pass rate: 1/1 (100.0%)

## [qwen3.5:9b] add-multiple-todos-inline-list

Add multiple todos in one message

Pass rate: 1/1 (100.0%)

## [qwen3.5:9b] ambiguous-update-needs-clarification

Ambiguous update asks for clarification

Pass rate: 1/1 (100.0%)

## [qwen3.5:9b] delete-specific-todo

Delete one matching todo

Pass rate: 1/1 (100.0%)

## [qwen3.5:9b] greeting-then-add-todo

Greeting before task creation

Pass rate: 1/1 (100.0%)

## [qwen3.5:9b] retrieve-todos-after-creation

Retrieve todos after creating them

Pass rate: 1/1 (100.0%)

## [qwen3.5:9b] update-specific-todo

Update a specific todo by description

Pass rate: 1/1 (100.0%)
