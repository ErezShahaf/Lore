function buildNoiseThoughtDocuments(prefix, count) {
  return Array.from({ length: count }, (_unused, index) => ({
    content: `${prefix} note ${index + 1}: unrelated planning detail ${index + 1}.`,
    type: 'thought',
    tags: ['noise'],
    source: 'eval-seed',
  }))
}

export const scenarios = [
  {
    id: 'add-single-todo-explicit',
    title: 'Add a single explicit todo',
    suites: ['smoke', 'full'],
    steps: [
      {
        userInput: 'Add to my todo list: buy milk',
        expect: {
          responseIncludes: ['saved'],
          storedCount: 1,
          todoCount: 1,
          todoContentsIncludeSubstrings: ['buy milk'],
          dataJudge: 'The todo database should contain exactly one actionable todo representing buying milk. Minor normalization differences like prefixes are acceptable, but unrelated tasks are not.',
        },
      },
    ],
  },
  {
    id: 'add-single-todo-variant-phrasing',
    title: 'Add a todo with alternate phrasing',
    suites: ['full'],
    steps: [
      {
        userInput: 'Please put "call mom" on my todo list.',
        expect: {
          responseIncludes: ['saved'],
          storedCount: 1,
          todoCount: 1,
          todoContentsIncludeSubstrings: ['call mom'],
        },
      },
    ],
  },
  {
    id: 'add-multiple-todos-inline-list',
    title: 'Add multiple todos in one message',
    suites: ['smoke', 'full'],
    steps: [
      {
        userInput: 'Todos: buy milk, call mom, pay rent',
        expect: {
          responseIncludes: ['saved 3 todos'],
          storedCount: 3,
          todoCount: 3,
          todoContentsIncludeSubstrings: ['buy milk', 'call mom', 'pay rent'],
          dataJudge: 'The todo database should contain three distinct actionable tasks corresponding to buy milk, call mom, and pay rent.',
        },
      },
    ],
  },
  {
    id: 'add-multiple-todos-multiline',
    title: 'Add todos from a multiline list',
    suites: ['full'],
    steps: [
      {
        userInput: 'Add to my todo list:\nbook dentist\nrenew passport\nbuy cat food',
        expect: {
          storedCount: 3,
          todoCount: 3,
          todoContentsIncludeSubstrings: ['book dentist', 'renew passport', 'buy cat food'],
        },
      },
    ],
  },
  {
    id: 'greeting-then-add-todo',
    title: 'Greeting before task creation',
    suites: ['smoke', 'full'],
    steps: [
      {
        userInput: 'Hey, how are you today?',
        expect: {
          todoCount: 0,
        },
      },
      {
        userInput: 'Nice. Add to my todo list: stretch for ten minutes',
        expect: {
          storedCount: 1,
          todoCount: 1,
          todoContentsIncludeSubstrings: ['stretch for ten minutes'],
        },
      },
    ],
  },
  {
    id: 'smalltalk-random-question-then-add',
    title: 'Random smalltalk before action',
    suites: ['full'],
    steps: [
      {
        userInput: 'Hello! Quick question, what is your favorite color?',
        expect: {
          todoCount: 0,
        },
      },
      {
        userInput: 'Anyway, add to my todo list: buy new headphones',
        expect: {
          storedCount: 1,
          todoCount: 1,
          todoContentsIncludeSubstrings: ['buy new headphones'],
        },
      },
    ],
  },
  {
    id: 'retrieve-todos-after-creation',
    title: 'Retrieve todos after creating them',
    suites: ['smoke', 'full'],
    steps: [
      {
        userInput: 'Todos: buy milk, call mom',
        expect: {
          storedCount: 2,
          todoCount: 2,
        },
      },
      {
        userInput: 'What are my todos?',
        expect: {
          todoCount: 2,
          responseIncludes: ['buy milk', 'call mom'],
        },
      },
    ],
  },
  {
    id: 'retrieve-todos-with-casual-phrasing',
    title: 'Retrieve todos with casual wording',
    suites: ['full'],
    steps: [
      {
        userInput: 'Todos: pick up laundry, send the invoice',
        expect: {
          storedCount: 2,
          todoCount: 2,
        },
      },
      {
        userInput: 'What do I still need to do?',
        expect: {
          todoCount: 2,
          responseIncludes: ['pick up laundry', 'send the invoice'],
        },
      },
    ],
  },
  {
    id: 'seeded-large-db-targeted-retrieval',
    title: 'Retrieve the right fact from seeded large data',
    suites: ['full'],
    seedDocuments: [
      ...buildNoiseThoughtDocuments('Travel', 12),
      ...buildNoiseThoughtDocuments('Work', 12),
      {
        content: 'Farmers market list for Saturday: apples, pears, basil.',
        type: 'thought',
        tags: ['shopping', 'market', 'groceries'],
        source: 'eval-seed',
      },
      {
        content: 'Remember to book the dentist for next month.',
        type: 'thought',
        tags: ['health'],
        source: 'eval-seed',
      },
    ],
    steps: [
      {
        userInput: 'What did I want to buy from the farmers market?',
        expect: {
          minRetrievedCount: 1,
          maxRetrievedCount: 2,
          retrievedContentsIncludeSubstrings: ['Farmers market list'],
          responseJudge: 'The answer should clearly mention apples, pears, and basil as the farmers market items, and should not introduce unrelated seeded notes.',
          retrievalJudge: 'The retrieved documents should include the farmers market note and avoid pulling many unrelated noise documents.',
        },
      },
    ],
  },
  {
    id: 'seeded-ambiguous-retrieval-needs-clarification',
    title: 'Seeded retrieval ambiguity asks for clarification',
    suites: ['full'],
    seedDocuments: [
      ...buildNoiseThoughtDocuments('Project', 10),
      {
        content: 'Alex from design asked for a darker sidebar and tighter spacing.',
        type: 'thought',
        tags: ['alex', 'design', 'ui'],
        source: 'eval-seed',
      },
      {
        content: 'Alex from finance asked for monthly cash flow summaries in the report.',
        type: 'thought',
        tags: ['alex', 'finance', 'reporting'],
        source: 'eval-seed',
      },
    ],
    steps: [
      {
        userInput: 'What did Alex ask for?',
        expect: {
          requiresClarification: true,
          minRetrievedCount: 2,
          maxRetrievedCount: 3,
          retrievedContentsIncludeSubstrings: ['Alex from design', 'Alex from finance'],
          responseJudge: 'The assistant should explain that there are at least two plausible Alex matches and ask the user to clarify which Alex they mean before answering.',
        },
      },
    ],
  },
  {
    id: 'seeded-ambiguous-retrieval-clarification-resolves',
    title: 'Seeded retrieval clarification leads to the right Alex',
    suites: ['full'],
    seedDocuments: [
      ...buildNoiseThoughtDocuments('Project', 10),
      {
        content: 'Alex from design asked for a darker sidebar and tighter spacing.',
        type: 'thought',
        tags: ['alex', 'design', 'ui'],
        source: 'eval-seed',
      },
      {
        content: 'Alex from finance asked for monthly cash flow summaries in the report.',
        type: 'thought',
        tags: ['alex', 'finance', 'reporting'],
        source: 'eval-seed',
      },
    ],
    steps: [
      {
        userInput: 'What did Alex ask for?',
        simulatedUser: {
          userGoal: 'Find out what Alex from finance asked for.',
          maxAssistantTurns: 3,
          clarificationResponses: [
            {
              id: 'choose-finance-alex',
              label: 'Choose the finance Alex',
              triggerRubric: 'The assistant is asking the user to clarify which Alex they mean because there are multiple plausible Alex matches.',
              userInput: 'I mean Alex from finance.',
            },
          ],
        },
        expect: {
          clarificationRequestedDuringInteraction: true,
          minRetrievedCount: 1,
          maxRetrievedCount: 2,
          retrievedContentsIncludeSubstrings: ['Alex from finance'],
          responseJudge: 'After the clarification, the final answer should clearly say that Alex from finance asked for monthly cash flow summaries in the report.',
        },
      },
    ],
  },
  {
    id: 'seeded-retrieval-threshold-discipline',
    title: 'Seeded retrieval keeps the result set focused',
    suites: ['full'],
    seedDocuments: [
      ...buildNoiseThoughtDocuments('City', 8),
      {
        content: 'Tokyo restaurant shortlist: Sushi Saito.',
        type: 'thought',
        tags: ['tokyo', 'restaurant', 'food'],
        source: 'eval-seed',
      },
      {
        content: 'Tokyo hotel shortlist: Hoshinoya Tokyo.',
        type: 'thought',
        tags: ['tokyo', 'hotel', 'travel'],
        source: 'eval-seed',
      },
      {
        content: 'Kyoto restaurant shortlist: Monk.',
        type: 'thought',
        tags: ['kyoto', 'restaurant', 'food'],
        source: 'eval-seed',
      },
      {
        content: 'Tokyo subway tip: use the Suica card for easier transfers.',
        type: 'thought',
        tags: ['tokyo', 'subway', 'travel'],
        source: 'eval-seed',
      },
    ],
    steps: [
      {
        userInput: 'Which Tokyo restaurant did I want to try?',
        expect: {
          minRetrievedCount: 1,
          maxRetrievedCount: 2,
          maxRetrievedCandidates: 2,
          retrievedContentsIncludeSubstrings: ['Tokyo restaurant shortlist'],
          retrievedContentsExcludeSubstrings: ['Tokyo hotel shortlist', 'Kyoto restaurant shortlist'],
          responseJudge: 'The answer should identify Sushi Saito as the Tokyo restaurant and should not mention the hotel, subway tip, or Kyoto restaurant as if they answered the question.',
          retrievalJudge: 'The retrieval set should stay tightly focused on the Tokyo restaurant document and avoid semantically adjacent but irrelevant notes.',
        },
      },
    ],
  },
  {
    id: 'update-specific-todo',
    title: 'Update a specific todo by description',
    suites: ['smoke', 'full'],
    steps: [
      {
        userInput: 'Todos: buy milk, call mom',
        expect: {
          storedCount: 2,
          todoCount: 2,
        },
      },
      {
        userInput: 'Change the todo about milk to buy oat milk',
        expect: {
          todoCount: 2,
          todoContentsIncludeSubstrings: ['buy oat milk', 'call mom'],
          todoContentsExcludeExact: ['buy milk'],
          dataJudge: 'After the update, one todo should still represent calling mom and the milk-related todo should now represent buying oat milk rather than plain milk.',
        },
      },
    ],
  },
  {
    id: 'ambiguous-update-needs-clarification',
    title: 'Ambiguous update asks for clarification',
    suites: ['smoke', 'full'],
    steps: [
      {
        userInput: 'Todos: jump on the water, drink the water',
        expect: {
          storedCount: 2,
          todoCount: 2,
        },
      },
      {
        userInput: 'Edit the water to fire',
        expect: {
          requiresClarification: true,
          todoCount: 2,
          todoContentsIncludeExact: ['jump on the water', 'drink the water'],
          todoContentsExcludeSubstrings: ['fire'],
        },
      },
    ],
  },
  {
    id: 'clarification-resolves-ambiguous-update',
    title: 'Clarification follow-up resolves the right todo',
    suites: ['full'],
    steps: [
      {
        userInput: 'Todos: jump on the water, drink the water',
        expect: {
          storedCount: 2,
          todoCount: 2,
        },
      },
      {
        userInput: 'Edit the water to fire',
        simulatedUser: {
          userGoal: 'Change the todo about drinking water so it becomes "drink the fire".',
          maxAssistantTurns: 3,
          clarificationResponses: [
            {
              id: 'choose-drinking-todo',
              label: 'Choose the drinking todo',
              triggerRubric: 'The assistant is asking the user to clarify which water-related todo should be updated.',
              userInput: 'The one about drinking. Change it to drink the fire.',
            },
          ],
        },
        expect: {
          clarificationRequestedDuringInteraction: true,
          todoCount: 2,
          todoContentsIncludeSubstrings: ['jump on the water', 'drink the fire'],
          todoContentsExcludeExact: ['drink the water'],
        },
      },
    ],
  },
  {
    id: 'explicit-edit-similar-todos',
    title: 'Explicit edit of one similar todo',
    suites: ['full'],
    steps: [
      {
        userInput: 'Todos: jump on the water, drink the water',
        expect: {
          storedCount: 2,
          todoCount: 2,
        },
      },
      {
        userInput: 'Change "jump on the water" to "jump on the fire"',
        expect: {
          todoCount: 2,
          todoContentsIncludeSubstrings: ['jump on the fire', 'drink the water'],
          todoContentsExcludeExact: ['jump on the water'],
        },
      },
    ],
  },
  {
    id: 'delete-specific-todo',
    title: 'Delete one matching todo',
    suites: ['smoke', 'full'],
    steps: [
      {
        userInput: 'Todos: buy milk, buy bread',
        expect: {
          storedCount: 2,
          todoCount: 2,
        },
      },
      {
        userInput: 'Remove the todo about milk',
        expect: {
          deletedCount: 1,
          todoCount: 1,
          todoContentsIncludeExact: ['buy bread'],
          todoContentsExcludeExact: ['buy milk'],
        },
      },
    ],
  },
  {
    id: 'ambiguous-delete-needs-clarification',
    title: 'Ambiguous delete does not act immediately',
    suites: ['full'],
    steps: [
      {
        userInput: 'Todos: jump on the water, drink the water',
        expect: {
          storedCount: 2,
          todoCount: 2,
        },
      },
      {
        userInput: 'Delete the water one',
        expect: {
          requiresClarification: true,
          todoCount: 2,
          deletedCount: 0,
        },
      },
    ],
  },
  {
    id: 'clarification-resolves-ambiguous-delete',
    title: 'Clarification follow-up deletes the intended todo',
    suites: ['full'],
    steps: [
      {
        userInput: 'Todos: jump on the water, drink the water',
        expect: {
          storedCount: 2,
          todoCount: 2,
        },
      },
      {
        userInput: 'Delete the water one',
        simulatedUser: {
          userGoal: 'Delete the todo about drinking water, not the jumping one.',
          maxAssistantTurns: 3,
          clarificationResponses: [
            {
              id: 'delete-drinking-todo',
              label: 'Delete the drinking todo',
              triggerRubric: 'The assistant is asking the user to clarify which water-related todo should be deleted.',
              userInput: 'Delete the one about drinking water.',
            },
          ],
        },
        expect: {
          clarificationRequestedDuringInteraction: true,
          deletedCount: 1,
          todoCount: 1,
          todoContentsIncludeExact: ['jump on the water'],
          todoContentsExcludeExact: ['drink the water'],
        },
      },
    ],
  },
  {
    id: 'instruction-does-not-become-todo',
    title: 'Instruction stays separate from todos',
    suites: ['full'],
    steps: [
      {
        userInput: 'From now on answer very briefly.',
        expect: {
          todoCount: 0,
        },
      },
      {
        userInput: 'Add to my todo list: book train tickets',
        expect: {
          storedCount: 1,
          todoCount: 1,
          todoContentsIncludeSubstrings: ['book train tickets'],
        },
      },
      {
        userInput: 'What are my todos?',
        expect: {
          todoCount: 1,
          responseIncludes: ['book train tickets'],
          responseExcludes: ['answer very briefly'],
        },
      },
    ],
  },
  {
    id: 'low-confidence-vague-request',
    title: 'Vague request does not mutate state',
    suites: ['smoke', 'full'],
    steps: [
      {
        userInput: 'Do the thing',
        expect: {
          todoCount: 0,
          responseIncludes: ['not sure'],
        },
      },
    ],
  },
  {
    id: 'duplicate-todo-still-persists-separately',
    title: 'Near-duplicate todo requests still store separately',
    suites: ['full'],
    steps: [
      {
        userInput: 'Add to my todo list: call the plumber',
        expect: {
          storedCount: 1,
          todoCount: 1,
        },
      },
      {
        userInput: 'Add to my todo list: call the plumber',
        expect: {
          storedCount: 1,
          todoCount: 2,
          todoContentsIncludeExact: ['call the plumber'],
        },
      },
    ],
  },
  {
    id: 'pure-greeting-does-not-store',
    title: 'Greeting alone does not create data',
    suites: ['full'],
    steps: [
      {
        userInput: 'Hi there!',
        expect: {
          todoCount: 0,
        },
      },
    ],
  },
]

export function getScenarioById(scenarioId) {
  return scenarios.find((scenario) => scenario.id === scenarioId) || null
}
