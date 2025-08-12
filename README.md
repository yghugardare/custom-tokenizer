# Custom Tokenizer

A TypeScript implementation of a custom text tokenizer with a React demo interface for building vocabularies, encoding text, and decoding tokens.

## 🚀 Live Demo

**[Try it live here →](https://yghugardare.github.io/custom-tokenizer/)**

## ✨ Features

- **Custom Vocabulary Building**: Build vocabularies from single texts or multiple document corpus
- **Frequency-based Tokenization**: Prioritizes common tokens for efficient encoding
- **Special Tokens Support**: Handles `<PAD>`, `<UNK>`, `<CLS>`, `<SEP>` tokens
- **Configurable Options**: Case sensitivity, vocabulary size limits
- **Interactive UI**: Real-time tokenization with visual feedback
- **TypeScript**: Fully typed for better development experience

## 🛠️ Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/custom-tokenizer.git
cd custom-tokenizer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📚 Usage

### Basic Tokenizer Usage

```typescript
import { CustomTokenizer } from './utils/tokenizer';

// Create tokenizer with options
const tokenizer = new CustomTokenizer({
  caseSensitive: false,
  maxVocabSize: 1000
});

// Build vocabulary from text
tokenizer.buildVocabFromInputText("Hello world!");

// Or build from multiple texts (recommended)
const corpus = ["Hello world!", "How are you?", "Fine, thanks!"];
tokenizer.buildVocabFromCorpus(corpus);

// Encode text
const encoded = tokenizer.encode("Hello there!");
console.log(encoded); // [2, 4, 5, 3] (example)

// Decode tokens
const decoded = tokenizer.decode(encoded);
console.log(decoded); // "hello there"
```

### Web Interface

1. **Configure Settings**: Toggle case sensitivity and set vocabulary limits
2. **Enter Text**: Type or select sample text
3. **Build Vocabulary**: Choose single text or corpus-based approach
4. **Encode**: Convert text to token IDs
5. **Decode**: Convert token IDs back to text
6. **Explore**: View vocabulary table with token types and frequencies

## 🏗️ API Reference

### Constructor Options
```typescript
interface TokenizerOptions {
  specialTokens?: string[];        // Default: ["<PAD>", "<UNK>", "<CLS>", "<SEP>"]
  caseSensitive?: boolean;         // Default: false
  maxVocabSize?: number;          // Default: undefined (no limit)
}
```

### Main Methods
- `buildVocabFromInputText(text: string)` - Build vocabulary from single text
- `buildVocabFromCorpus(texts: string[])` - Build vocabulary from multiple texts (recommended)
- `encode(text: string): number[]` - Convert text to token IDs
- `decode(encodedTokens: number[]): string` - Convert token IDs to text
- `toJSON()` / `fromJSON()` - Serialize/deserialize tokenizer

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check
```

## 📁 Project Structure

```
├── src/
│   ├── utils/
│   │   └── tokenizer.ts     # Core tokenizer implementation
│   ├── App.tsx             # React demo interface
│   └── main.tsx           # App entry point
├── public/                # Static assets
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with TypeScript, React, and Tailwind CSS**