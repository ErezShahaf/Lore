export const RESTRUCTURE_PROMPT = `Restructure the following raw thought into a clear, well-organized note.
Preserve all information but improve clarity and structure.
If it contains action items, format them as a bullet list.
If it mentions specific dates, people, or projects, highlight them.
Keep it concise. Do NOT wrap in markdown code fences. Return only the restructured note.

Raw input: {userInput}`
