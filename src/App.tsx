import { useState, useCallback, useMemo } from "react";
import { CustomTokenizer } from "./utils/tokenizer.ts";



interface TokenizerState {
  vocab: Record<string, number>;
  encoded: number[];
  decoded: string;
  error: string | null;
  isProcessing: boolean;
}

// Sample texts for demonstration
const SAMPLE_TEXTS = [
  "Hello world! How are you today?",
  "The quick brown fox jumps over the lazy dog.",
  "Learning Generative AI with Hitesh and Piyush Sir!",
  "Machine learning, deep learning, and AI are transformative technologies."
];

function App() {
  const [inputText, setInputText] = useState("");
  const [tokenizerOptions, setTokenizerOptions] = useState({
    caseSensitive: false,
    maxVocabSize: 1000
  });
  
  const [state, setState] = useState<TokenizerState>({
    vocab: {},
    encoded: [],
    decoded: "",
    error: null,
    isProcessing: false
  });

  // Create tokenizer with current options
  const tokenizer = useMemo(() => {
    return new CustomTokenizer({
      caseSensitive: tokenizerOptions.caseSensitive,
      maxVocabSize: tokenizerOptions.maxVocabSize
    });
  }, [tokenizerOptions]);

  // Helper function to handle errors
  const handleError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    setState(prev => ({ ...prev, error: message, isProcessing: false }));
  }, []);

  // Clear error when user starts typing
  const handleInputChange = useCallback((value: string) => {
    setInputText(value);
    if (state.error) {
      setState(prev => ({ ...prev, error: null }));
    }
  }, [state.error]);

  // Build vocabulary from input text
  const buildVocab = useCallback(async () => {
    if (!inputText.trim()) {
      setState(prev => ({ ...prev, error: "Please enter some text first" }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      tokenizer.buildVocabFromInputText(inputText);
      const newVocab = tokenizer.vocabulary;
      
      setState(prev => ({
        ...prev,
        vocab: newVocab,
        encoded: [], // Reset encoded when vocab changes
        decoded: "", // Reset decoded when vocab changes
        isProcessing: false
      }));
    } catch (error) {
      handleError(error);
    }
  }, [inputText, tokenizer, handleError]);

  // Build vocabulary from multiple sample texts
  const buildVocabFromCorpus = useCallback(async () => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const corpus = inputText.trim() ? [...SAMPLE_TEXTS, inputText] : SAMPLE_TEXTS;
      tokenizer.buildVocabFromCorpus(corpus);
      const newVocab = tokenizer.vocabulary;
      
      setState(prev => ({
        ...prev,
        vocab: newVocab,
        encoded: [],
        decoded: "",
        isProcessing: false
      }));
    } catch (error) {
      handleError(error);
    }
  }, [inputText, tokenizer, handleError]);

  // Encode input text
  const encodeInputText = useCallback(async () => {
    if (!inputText.trim()) {
      setState(prev => ({ ...prev, error: "Please enter some text to encode" }));
      return;
    }

    if (Object.keys(state.vocab).length === 0) {
      setState(prev => ({ ...prev, error: "Please build vocabulary first" }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const encodedTokens = tokenizer.encode(inputText);
      setState(prev => ({
        ...prev,
        encoded: encodedTokens,
        decoded: "", // Reset decoded when new encoding is done
        isProcessing: false
      }));
    } catch (error) {
      handleError(error);
    }
  }, [inputText, state.vocab, tokenizer, handleError]);

  // Decode encoded tokens
  const decodeEncodedTokens = useCallback(async () => {
    if (state.encoded.length === 0) {
      setState(prev => ({ ...prev, error: "Please encode some text first" }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const decodedString = tokenizer.decode(state.encoded);
      setState(prev => ({
        ...prev,
        decoded: decodedString,
        isProcessing: false
      }));
    } catch (error) {
      handleError(error);
    }
  }, [state.encoded, tokenizer, handleError]);

  // Clear all data
  const clearAll = useCallback(() => {
    setInputText("");
    setState({
      vocab: {},
      encoded: [],
      decoded: "",
      error: null,
      isProcessing: false
    });
  }, []);

  // Load sample text
  const loadSampleText = useCallback((text: string) => {
    setInputText(text);
    if (state.error) {
      setState(prev => ({ ...prev, error: null }));
    }
  }, [state.error]);

  const vocabEntries = Object.entries(state.vocab);
  const specialTokens = ["<PAD>", "<UNK>", "<CLS>", "<SEP>"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Custom Tokenizer</h1>
          <p className="text-gray-600">Build vocabulary, encode text, and decode tokens</p>
        </div>

        {/* Tokenizer Options */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Tokenizer Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tokenizerOptions.caseSensitive}
                  onChange={(e) => setTokenizerOptions(prev => ({
                    ...prev,
                    caseSensitive: e.target.checked
                  }))}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Case Sensitive</span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-700">Max Vocab Size:</label>
              <input
                type="number"
                value={tokenizerOptions.maxVocabSize}
                onChange={(e) => setTokenizerOptions(prev => ({
                  ...prev,
                  maxVocabSize: parseInt(e.target.value) || 1000
                }))}
                className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="10"
                max="50000"
              />
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Input Text</h2>
            <div className="flex gap-2">
              <select
                onChange={(e) => e.target.value && loadSampleText(e.target.value)}
                className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value=""
              >
                <option value="">Load Sample Text</option>
                {SAMPLE_TEXTS.map((text, index) => (
                  <option key={index} value={text}>
                    Sample {index + 1}
                  </option>
                ))}
              </select>
              <button
                onClick={clearAll}
                className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <textarea
            className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Enter your text here or select a sample from the dropdown..."
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          
          {inputText && (
            <div className="mt-2 text-sm text-gray-500">
              Characters: {inputText.length} | Words: {inputText.trim().split(/\s+/).length}
            </div>
          )}
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="text-red-700">{state.error}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
              onClick={buildVocab}
              disabled={state.isProcessing}
            >
              {state.isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                "Build Vocabulary"
              )}
            </button>
            
            <button
              className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
              onClick={buildVocabFromCorpus}
              disabled={state.isProcessing}
            >
              Build from Corpus
            </button>
            
            <button
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors"
              onClick={encodeInputText}
              disabled={state.isProcessing}
            >
              Encode Text
            </button>
            
            <button
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
              onClick={decodeEncodedTokens}
              disabled={state.isProcessing}
            >
              Decode Tokens
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Encoded Tokens */}
          {state.encoded.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Encoded Tokens</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-1">
                  {state.encoded.map((token, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono"
                    >
                      {token}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Token count: {state.encoded.length}
              </div>
            </div>
          )}

          {/* Decoded Text */}
          {state.decoded && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Decoded Text</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">{state.decoded}</p>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Original: "{inputText}"<br/>
                Decoded: "{state.decoded}"<br/>
                Match: {inputText.toLowerCase().trim() === state.decoded.toLowerCase().trim() ? "✅ Yes" : "❌ No"}
              </div>
            </div>
          )}
        </div>

        {/* Vocabulary Table */}
        {vocabEntries.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Vocabulary</h2>
              <div className="text-sm text-gray-500">
                Total tokens: {vocabEntries.length}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">Token</th>
                    <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vocabEntries.map(([token, id]) => (
                    <tr key={token} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">
                        <span className={specialTokens.includes(token) ? "bg-yellow-100 px-1 rounded" : ""}>
                          {token}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{id}</td>
                      <td className="px-4 py-3 text-sm">
                        {specialTokens.includes(token) ? (
                          <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Special</span>
                        ) : (
                          <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">Regular</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;