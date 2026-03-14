export const TARGET_IDENTIFICATION_PROMPT = `The user wants to {action} something in their personal knowledge base.
Based on their input and the following matching documents, identify which document(s) they're referring to.

User input: {userInput}

Matching documents:
{documents}

Return JSON with this exact structure:
{
  "targetDocumentIds": ["id1"],
  "action": "delete" | "update" | "complete",
  "updatedContent": "<new content if action is update, null otherwise>",
  "confidence": 0.0-1.0
}

IMPORTANT: Return ONLY valid JSON, no other text.`
