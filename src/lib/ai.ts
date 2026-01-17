import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GeneratedFlashcard {
  question: string
  answer: string
  hint?: string
  difficulty: number
}

export async function generateFlashcards(
  content: string,
  numberOfCards: number = 10
): Promise<GeneratedFlashcard[]> {
  const prompt = `You are an expert educator creating study flashcards for a high school student.
Based on the following content, generate ${numberOfCards} flashcards that will help the student learn and remember the key concepts.

Each flashcard should:
- Have a clear, specific question
- Have a concise but complete answer
- Include an optional hint (helpful clue without giving away the answer)
- Have a difficulty rating from 1-5 (1=easy, 5=challenging)

Mix different types of questions:
- Definition questions ("What is...?")
- Explanation questions ("Why does...?", "How does...?")
- Application questions ("What would happen if...?")
- Comparison questions ("How does X differ from Y?")

Content to create flashcards from:
---
${content.substring(0, 8000)}
---

Respond with a JSON array of flashcards in this exact format:
[
  {
    "question": "Your question here",
    "answer": "Your answer here",
    "hint": "Optional hint here",
    "difficulty": 2
  }
]

Only respond with the JSON array, no other text.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const text = response.choices[0]?.message?.content || '[]'

    // Clean up the response in case it has markdown code blocks
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const flashcards = JSON.parse(cleanedText) as GeneratedFlashcard[]

    return flashcards.map(card => ({
      question: card.question,
      answer: card.answer,
      hint: card.hint || undefined,
      difficulty: Math.min(5, Math.max(1, card.difficulty || 2)),
    }))
  } catch (error) {
    console.error('Error generating flashcards:', error)
    throw new Error('Failed to generate flashcards. Please check your API key and try again.')
  }
}

export async function generateQuizQuestions(
  content: string,
  numberOfQuestions: number = 5
): Promise<{
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}[]> {
  const prompt = `You are an expert educator creating a multiple-choice quiz for a high school student.
Based on the following content, generate ${numberOfQuestions} multiple-choice questions.

Each question should:
- Test understanding of key concepts
- Have exactly 4 answer options (A, B, C, D)
- Have only one correct answer
- Include an explanation for why the correct answer is right

Content:
---
${content.substring(0, 8000)}
---

Respond with a JSON array in this exact format:
[
  {
    "question": "Your question here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Explanation of why this is correct"
  }
]

Only respond with the JSON array, no other text.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const text = response.choices[0]?.message?.content || '[]'
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return JSON.parse(cleanedText)
  } catch (error) {
    console.error('Error generating quiz:', error)
    throw new Error('Failed to generate quiz. Please check your API key and try again.')
  }
}
