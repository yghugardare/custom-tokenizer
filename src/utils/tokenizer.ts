export type Vocab = Record<string, number>;
export type ReverseVocab = Record<number, string>;

export interface TokenizerOptions {
  specialTokens?: string[];
  caseSensitive?: boolean;
  maxVocabSize?: number;
}

export class CustomTokenizer {
  private vocab: Vocab = {};
  // reverse vocab needed to simplify the decoding process
  private reverseVocab: ReverseVocab = {};
  private readonly specialTokens: readonly string[];
  private readonly caseSensitive: boolean;
  private readonly maxVocabSize?: number;

  get vocabSize(): number {
    return Object.keys(this.vocab).length;
  }

  get vocabulary(): Readonly<Vocab> {
    return { ...this.vocab };
  }
  constructor(options: TokenizerOptions) {
    this.specialTokens = Object.freeze(
      options.specialTokens ?? ["<PAD>", "<UNK>", "<CLS>", "<SEP>"]
    );
    this.caseSensitive = options.caseSensitive ?? false;
    // memory efficiency and prevent rare words from
    // ruining our vocab
    this.maxVocabSize = options.maxVocabSize;
    this.initializeSpecialTokens();
  }

  private initializeSpecialTokens() {
    this.vocab = {};
    this.specialTokens.forEach((token, index) => {
      this.vocab[token] = index;
    });
    this.buildReverseVocabFromVocab();
  }

  private splitTextTokens(text: string) {
    // handle case sensitivity
    const processedText = this.caseSensitive ? text : text.toLowerCase();

    // handle punctionations, spaces
    const tokens = processedText
      .replace(/([.!?;:()'"–—])/g, " $1 ") // Split punctuation
      .replace(/([,])/g, " $1 ") // Split commas
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .split(" ")
      .filter((token) => token.length > 0); // Remove empty strings

    return tokens;
  }

  buildVocabFromInputText(text: string): void {
    this.initializeSpecialTokens();
    const tokens = this.splitTextTokens(text);

    // handle duplicates by using sets
    const uniqueTokens = new Set(tokens);

    for (const token of uniqueTokens) {
      // check for max vocab size
      if (this.maxVocabSize && this.vocabSize >= this.maxVocabSize) {
        console.warn(
          `Vocabulary size limit (${this.maxVocabSize}) reached. Some tokens may not be added.`
        );
        break;
      }
      if (!(token in this.vocab)) {
        // as vocab keeps increasing we will leverage that vocab's length to set its numeric value
        this.vocab[token] = this.vocabSize;
      }
    }
    this.buildReverseVocabFromVocab();
  }

  // main goal => assign low id [numeric value] to the token that is most frequently occuring in corpus
  buildVocabFromCorpus(texts: string[]): void {
    this.initializeSpecialTokens();
    const tokenCounts = new Map<string, number>();

    for (const text of texts) {
      const tokens = this.splitTextTokens(text);
      for (const token of tokens) {
        tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
      }
    }

    // sort by frequency in descending order
    const sortedTokens = Array.from(tokenCounts.entries())
      // keep unused var for better readibilty
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .sort(([, freqA], [, freqB]) => freqB - freqA)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([token]) => token);

    // Add tokens respecting vocab size limit
    for (const token of sortedTokens) {
      if (this.maxVocabSize && this.vocabSize >= this.maxVocabSize) {
        break;
      }

      if (!(token in this.vocab)) {
        // most freq words get less numeric value
        this.vocab[token] = this.vocabSize;
      }
    }
    this.buildReverseVocabFromVocab();
  }

  // text = Hello there
  //   [Hello,there] = [<CLS>,4,5,<SEP>] = [2,4,5,3]
  encode(text: string): number[] {
    // Ex - ["Hello","there"]
    const tokens = this.splitTextTokens(text);
    // Get -> [4,5]
    const tokenIds = tokens.map((token) => {
      const tokenId = this.vocab[token];
      if (tokenId === undefined) {
        const unkId = this.vocab["<UNK>"];
        if (unkId === undefined) {
          throw new Error("UNK token not found in vocabulary");
        }
        return unkId;
      }
      return tokenId;
    });
    // make this [4,5] => [2,4,5,3]
    const clsId = this.vocab["<CLS>"];
    const sepId = this.vocab["<SEP>"];

    if (clsId === undefined || sepId === undefined) {
      throw new Error(
        "Required special tokens (CLS, SEP) not found in vocabulary"
      );
    }

    return [clsId, ...tokenIds, sepId];
  }

  private buildReverseVocabFromVocab(): void {
    this.reverseVocab = {};
    Object.entries(this.vocab).forEach(([token, id]) => {
      this.reverseVocab[id] = token;
    });
  }

  // [2,4,5,3] => [<CLS>,4,5,<SEP>] => [Hello,there] => Hello there
  decode(encodedTokens: number[]): string {
    const decodedTokens = encodedTokens.map(
      (tokenId) => this.reverseVocab[tokenId]
    );

    // [<CLS>,Hell,there,<SEP>] => [Hello,there]
    const filteredTokens = decodedTokens.filter(
      (token) => !this.specialTokens.includes(token)
    );

    // merge punctuations and join the array to final string
    let result = "";
    for (let i = 0; i < filteredTokens.length; i++) {
      const token = filteredTokens[i];

      // Check if token is punctuation
      if (/^[.,!?;:()'"`–—-]$/.test(token)) {
        // Remove trailing space before punctuation
        result = result.trimEnd() + token;
        // Add space after punctuation if not at end
        if (i < filteredTokens.length - 1) {
          result += " ";
        }
      } else {
        // Regular word - add with space
        result += token;
        if (i < filteredTokens.length - 1) {
          result += " ";
        }
      }
    }

    return result.trim();
  }
  // Utility methods
  getTokenId(token: string): number | undefined {
    return this.vocab[token];
  }

  getToken(id: number): string | undefined {
    return this.reverseVocab[id];
  }

  hasToken(token: string): boolean {
    return token in this.vocab;
  }

  // Serialization methods for saving/loading
  toJSON(): { vocab: Vocab; specialTokens: string[]; caseSensitive: boolean } {
    return {
      vocab: this.vocab,
      specialTokens: [...this.specialTokens],
      caseSensitive: this.caseSensitive,
    };
  }

  static fromJSON(data: {
    vocab: Vocab;
    specialTokens: string[];
    caseSensitive: boolean;
  }): CustomTokenizer {
    const tokenizer = new CustomTokenizer({
      specialTokens: data.specialTokens,
      caseSensitive: data.caseSensitive,
    });
    tokenizer.vocab = { ...data.vocab };
    tokenizer.buildReverseVocabFromVocab();
    return tokenizer;
  }
}
