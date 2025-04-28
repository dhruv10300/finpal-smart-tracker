import { Transaction, Category } from '@/types/expense';

// Simple TF-IDF implementation
class TfIdfVectorizer {
  private vocabulary: Map<string, number>;
  private documentFrequency: Map<string, number>;
  private totalDocuments: number;
  
  constructor() {
    this.vocabulary = new Map();
    this.documentFrequency = new Map();
    this.totalDocuments = 0;
  }
  
  private tokenize(text: string): string[] {
    // Clean and normalize the text
    const cleanedText = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
      .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
      .trim();
    
    // Split into tokens (words)
    return cleanedText.split(' ');
  }
  
  fit(texts: string[]): void {
    this.totalDocuments = texts.length;
    
    // Process each document
    const documentsWithWords = texts.map(text => this.tokenize(text));
    
    // Build vocabulary and document frequency
    documentsWithWords.forEach(tokens => {
      // Count unique words in this document
      const uniqueTokens = new Set(tokens);
      
      uniqueTokens.forEach(token => {
        // Update document frequency
        this.documentFrequency.set(
          token, 
          (this.documentFrequency.get(token) || 0) + 1
        );
        
        // Add to vocabulary if not already present
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, this.vocabulary.size);
        }
      });
    });
  }
  
  transform(texts: string[]): number[][] {
    const vectors: number[][] = [];
    
    texts.forEach(text => {
      const tokens = this.tokenize(text);
      const vector = new Array(this.vocabulary.size).fill(0);
      
      // Calculate term frequency
      const termCounts = new Map<string, number>();
      tokens.forEach(token => {
        termCounts.set(token, (termCounts.get(token) || 0) + 1);
      });
      
      // Calculate TF-IDF for each term
      termCounts.forEach((count, token) => {
        if (this.vocabulary.has(token)) {
          const termIndex = this.vocabulary.get(token)!;
          const tf = count / tokens.length; // Term frequency
          const df = this.documentFrequency.get(token) || 0;
          
          if (df > 0) {
            const idf = Math.log(this.totalDocuments / df); // Inverse document frequency
            vector[termIndex] = tf * idf;
          }
        }
      });
      
      vectors.push(vector);
    });
    
    return vectors;
  }
  
  fitTransform(texts: string[]): number[][] {
    this.fit(texts);
    return this.transform(texts);
  }
  
  getVocabularySize(): number {
    return this.vocabulary.size;
  }
}

// Transaction classifier using a simple Naive Bayes approach
export class TransactionCategorizer {
  private vectorizer: TfIdfVectorizer;
  private categories: Map<string, string>; // Map category IDs to names
  private categoryFeatures: Map<string, number[]>; // Mean vector for each category
  private categoryPriors: Map<string, number>; // Prior probability for each category
  private trained: boolean;
  private feedbackData: {description: string, actualCategoryId: string}[];
  
  constructor() {
    this.vectorizer = new TfIdfVectorizer();
    this.categories = new Map();
    this.categoryFeatures = new Map();
    this.categoryPriors = new Map();
    this.trained = false;
    this.feedbackData = [];
  }
  
  train(transactions: Transaction[], categories: Category[]): void {
    if (transactions.length === 0) return;
    
    // Store category data
    categories.forEach(category => {
      this.categories.set(category.id, category.name);
    });
    
    // Prepare training data
    const descriptions: string[] = transactions.map(t => t.description);
    const categoryIds: string[] = transactions.map(t => t.categoryId);
    
    // Create feature vectors
    const features = this.vectorizer.fitTransform(descriptions);
    
    // Calculate category priors and mean feature vectors
    const categoryCounts = new Map<string, number>();
    const categoryVectors = new Map<string, number[][]>();
    
    categoryIds.forEach((categoryId, index) => {
      categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
      
      if (!categoryVectors.has(categoryId)) {
        categoryVectors.set(categoryId, []);
      }
      
      categoryVectors.get(categoryId)!.push(features[index]);
    });
    
    // Calculate priors
    categoryCounts.forEach((count, categoryId) => {
      this.categoryPriors.set(categoryId, count / transactions.length);
    });
    
    // Calculate mean vectors for each category
    categoryVectors.forEach((vectors, categoryId) => {
      const mean = new Array(this.vectorizer.getVocabularySize()).fill(0);
      
      vectors.forEach(vector => {
        for (let i = 0; i < vector.length; i++) {
          mean[i] += vector[i];
        }
      });
      
      // Normalize by number of vectors
      for (let i = 0; i < mean.length; i++) {
        mean[i] /= vectors.length;
      }
      
      this.categoryFeatures.set(categoryId, mean);
    });
    
    this.trained = true;
  }
  
  predict(description: string): { categoryId: string, confidence: number } {
    if (!this.trained) {
      throw new Error("Model has not been trained yet");
    }
    
    // Vectorize the input description
    const vector = this.vectorizer.transform([description])[0];
    
    // Calculate score for each category (dot product with mean vector)
    const scores = new Map<string, number>();
    
    this.categoryFeatures.forEach((meanVector, categoryId) => {
      // Dot product calculation
      let score = 0;
      for (let i = 0; i < vector.length && i < meanVector.length; i++) {
        score += vector[i] * meanVector[i];
      }
      
      // Adjust by prior probability
      score *= (this.categoryPriors.get(categoryId) || 0);
      scores.set(categoryId, score);
    });
    
    // Find category with highest score
    let bestCategoryId = '';
    let bestScore = -Infinity;
    
    scores.forEach((score, categoryId) => {
      if (score > bestScore) {
        bestScore = score;
        bestCategoryId = categoryId;
      }
    });
    
    // If all scores are zero (no features match), use priors only
    if (bestScore === 0) {
      let highestPrior = -Infinity;
      this.categoryPriors.forEach((prior, categoryId) => {
        if (prior > highestPrior) {
          highestPrior = prior;
          bestCategoryId = categoryId;
        }
      });
      
      bestScore = highestPrior;
    }
    
    // Convert score to confidence value (0-1 range)
    // Normalize by sum of all scores
    let totalScore = 0;
    scores.forEach(score => totalScore += Math.max(0, score));
    
    const confidence = totalScore > 0 ? Math.max(0, bestScore) / totalScore : 0;
    
    return {
      categoryId: bestCategoryId || Array.from(this.categories.keys())[0], // Fallback to first category
      confidence
    };
  }
  
  addFeedback(description: string, actualCategoryId: string): void {
    this.feedbackData.push({ description, actualCategoryId });
  }
  
  // Learn from user feedback and improve the model
  retrainWithFeedback(transactions: Transaction[], categories: Category[]): void {
    if (this.feedbackData.length === 0) return;
    
    // Create augmented transactions with feedback data
    const feedbackTransactions: Transaction[] = this.feedbackData.map((feedback, index) => ({
      id: `feedback-${index}`,
      date: new Date().toISOString(),
      description: feedback.description,
      amount: 0, // Not relevant for categorization
      categoryId: feedback.actualCategoryId,
      userId: '1'
    }));
    
    // Combine with original transactions and retrain
    const augmentedTransactions = [...transactions, ...feedbackTransactions];
    this.train(augmentedTransactions, categories);
    
    // Clear feedback data after retraining
    this.feedbackData = [];
  }
  
  // Get evaluation metrics
  evaluateModel(testTransactions: Transaction[]): {
    accuracy: number;
    categoryAccuracy: Map<string, { correct: number, total: number, accuracy: number }>;
  } {
    if (!this.trained || testTransactions.length === 0) {
      return { 
        accuracy: 0, 
        categoryAccuracy: new Map() 
      };
    }
    
    let correct = 0;
    const categoryStats = new Map<string, { correct: number, total: number }>();
    
    // Initialize category stats
    this.categories.forEach((_, categoryId) => {
      categoryStats.set(categoryId, { correct: 0, total: 0 });
    });
    
    // Test each transaction
    testTransactions.forEach(transaction => {
      const prediction = this.predict(transaction.description);
      const actualCategoryId = transaction.categoryId;
      
      // Update category stats
      const stats = categoryStats.get(actualCategoryId) || { correct: 0, total: 0 };
      stats.total += 1;
      
      if (prediction.categoryId === actualCategoryId) {
        correct += 1;
        stats.correct += 1;
      }
      
      categoryStats.set(actualCategoryId, stats);
    });
    
    // Calculate accuracy
    const accuracy = testTransactions.length > 0 ? correct / testTransactions.length : 0;
    
    // Calculate per-category accuracy
    const categoryAccuracy = new Map<string, { correct: number, total: number, accuracy: number }>();
    
    categoryStats.forEach((stats, categoryId) => {
      categoryAccuracy.set(categoryId, {
        ...stats,
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0
      });
    });
    
    return { accuracy, categoryAccuracy };
  }
}

// Singleton instance for use throughout the app
let categorizerInstance: TransactionCategorizer | null = null;

export const getCategorizer = (): TransactionCategorizer => {
  if (!categorizerInstance) {
    categorizerInstance = new TransactionCategorizer();
  }
  return categorizerInstance;
}; 