# CapyStudy 🦫

A cute capybara-themed study app that turns your notes into flashcards and quizzes. Perfect for high school students who want to ace their exams while having fun!

## Features

- **Organize by Class & Topic**: Keep your subjects organized with classes and topics
- **Upload Anything**: PDFs, images, PowerPoints, Word docs, text files, and YouTube links
- **AI-Powered Flashcards**: Automatically generate flashcards from your notes using OpenAI
- **Study Mode**: Interactive flashcard study sessions with self-assessment
- **Progress Tracking**: Watch your capybara swim across the lagoon as you learn!
- **Multi-Topic Study**: Study multiple topics at once for unit tests

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenAI API key (for flashcard generation)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd kakibarra
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Create a Class
- Go to "My Classes"
- Click "New Class"
- Add a name, description, emoji, and color

### 2. Add Topics
- Open a class
- Click "New Topic"
- Create topics for different chapters or units

### 3. Upload Notes
- In a topic, click "Add Notes"
- Upload a file (PDF, image, PowerPoint, Word) OR
- Paste text notes OR
- Add a YouTube video link

### 4. Generate Flashcards
- Click "Generate Flashcards" on any topic with notes
- The AI will analyze your notes and create study cards

### 5. Study!
- Go to "Study" tab
- Select the topics you want to review
- Flip cards and mark them correct/incorrect
- Watch your capybara swim to success!

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **AI**: OpenAI GPT-4o-mini for flashcard generation
- **Animations**: Framer Motion
- **File Processing**: pdf-parse, mammoth

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── classes/           # Class management pages
│   ├── study/             # Study mode page
│   └── progress/          # Progress tracking page
├── components/            # React components
│   ├── CapybaraLogo.tsx  # Capybara SVG components
│   └── Navigation.tsx     # Navigation bar
└── lib/                   # Utility functions
    ├── db.ts             # Database client
    ├── ai.ts             # AI flashcard generation
    └── file-processing.ts # File text extraction
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite database path (default: `file:./dev.db`) |
| `OPENAI_API_KEY` | Your OpenAI API key for flashcard generation |

## Contributing

Feel free to submit issues and pull requests!

## License

MIT
