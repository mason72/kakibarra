import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import fs from 'fs/promises'
import path from 'path'

export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filePath)
    const data = await pdf(dataBuffer)
    return data.text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filePath)
    const result = await mammoth.extractRawText({ buffer: dataBuffer })
    return result.value
  } catch (error) {
    console.error('Error extracting text from DOCX:', error)
    throw new Error('Failed to extract text from document')
  }
}

export async function extractTextFromPptx(filePath: string): Promise<string> {
  // For PowerPoint files, we'll use a simplified extraction
  // In a production app, you'd want a more robust PPTX parser
  try {
    const dataBuffer = await fs.readFile(filePath)
    // mammoth can handle some pptx content
    const result = await mammoth.extractRawText({ buffer: dataBuffer })
    if (result.value) {
      return result.value
    }
    return 'PowerPoint content - please add text notes for better flashcard generation.'
  } catch (error) {
    console.error('Error extracting text from PPTX:', error)
    return 'PowerPoint content - please add text notes for better flashcard generation.'
  }
}

export async function fetchYouTubeTranscript(url: string): Promise<string> {
  // Extract video ID from URL
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (!videoIdMatch) {
    throw new Error('Invalid YouTube URL')
  }

  const videoId = videoIdMatch[1]

  // Note: In a production app, you'd want to use the YouTube API or a transcript service
  // For now, we'll return a placeholder and let users add their own notes
  return `YouTube Video ID: ${videoId}

To generate better flashcards from this video:
1. Watch the video and take notes
2. Add your notes as text content
3. Generate flashcards from your notes

Tip: Many educational YouTube videos have transcripts available. You can:
- Click the "..." menu below the video
- Select "Show transcript"
- Copy and paste the transcript as text notes`
}

export async function processUploadedFile(
  file: File
): Promise<{ type: string; content?: string; filePath?: string }> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  // Ensure upload directory exists
  await fs.mkdir(uploadDir, { recursive: true })

  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const filePath = path.join(uploadDir, fileName)

  // Save the file
  const arrayBuffer = await file.arrayBuffer()
  await fs.writeFile(filePath, Buffer.from(arrayBuffer))

  const ext = path.extname(file.name).toLowerCase()

  let type: string
  let extractedText: string | undefined

  switch (ext) {
    case '.pdf':
      type = 'pdf'
      extractedText = await extractTextFromPDF(filePath)
      break
    case '.docx':
    case '.doc':
      type = 'docx'
      extractedText = await extractTextFromDocx(filePath)
      break
    case '.pptx':
    case '.ppt':
      type = 'pptx'
      extractedText = await extractTextFromPptx(filePath)
      break
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.webp':
      type = 'image'
      extractedText = 'Image file - add text description for better flashcard generation.'
      break
    case '.txt':
    case '.md':
      type = 'text'
      extractedText = await fs.readFile(filePath, 'utf-8')
      break
    default:
      type = 'other'
      extractedText = undefined
  }

  return {
    type,
    content: extractedText,
    filePath: `/uploads/${fileName}`,
  }
}

export function getFileTypeFromExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.pdf':
      return 'pdf'
    case '.docx':
    case '.doc':
      return 'docx'
    case '.pptx':
    case '.ppt':
      return 'pptx'
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.webp':
      return 'image'
    case '.txt':
    case '.md':
      return 'text'
    default:
      return 'other'
  }
}

export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url)
}
