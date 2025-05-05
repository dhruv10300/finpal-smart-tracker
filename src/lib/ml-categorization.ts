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

// Enhanced transaction classifier with improved prediction capabilities
export class TransactionCategorizer {
  private vectorizer: TfIdfVectorizer;
  private categories: Map<string, string>; // Map category IDs to names
  private categoryFeatures: Map<string, number[]>; // Mean vector for each category
  private categoryPriors: Map<string, number>; // Prior probability for each category
  private merchantToCategory: Map<string, Map<string, number>>; // Map merchant to category frequencies
  private seasonalPatterns: Map<string, Map<number, number>>; // Map category to monthly patterns
  private trained: boolean;
  private feedbackData: {description: string, actualCategoryId: string, date?: string}[];
  
  constructor() {
    this.vectorizer = new TfIdfVectorizer();
    this.categories = new Map();
    this.categoryFeatures = new Map();
    this.categoryPriors = new Map();
    this.merchantToCategory = new Map();
    this.seasonalPatterns = new Map();
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
    
    // Process merchant patterns
    this.processMerchantToCategory(transactions);
    
    // Process seasonal patterns
    this.processSeasonalPatterns(transactions);
    
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
  
  // Process merchant to category mapping
  private processMerchantToCategory(transactions: Transaction[]): void {
    // Clear existing data
    this.merchantToCategory.clear();
    
    transactions.forEach(transaction => {
      const merchant = this.extractMerchantName(transaction.description);
      if (!merchant) return;
      
      // Initialize merchant entry if it doesn't exist
      if (!this.merchantToCategory.has(merchant)) {
        this.merchantToCategory.set(merchant, new Map());
      }
      
      const categoryMap = this.merchantToCategory.get(merchant)!;
      // Increment category count for this merchant
      categoryMap.set(
        transaction.categoryId,
        (categoryMap.get(transaction.categoryId) || 0) + 1
      );
    });
  }
  
  // Extract merchant name from transaction description
  private extractMerchantName(description: string): string | null {
    if (!description) return null;
    
    // Clean the description
    const cleanedDesc = description.toLowerCase().trim();
    
    // Simple rule-based extraction
    // Take first part before any common separators
    const separators = [' - ', '/', 'payment to', 'purchase at', 'txn*'];
    
    for (const separator of separators) {
      if (cleanedDesc.includes(separator)) {
        const parts = cleanedDesc.split(separator);
        return parts[0].trim() || parts[1].trim();
      }
    }
    
    // Return first 3 words if no separator found
    const words = cleanedDesc.split(' ');
    return words.slice(0, Math.min(3, words.length)).join(' ');
  }
  
  // Process seasonal spending patterns by category
  private processSeasonalPatterns(transactions: Transaction[]): void {
    // Clear existing data
    this.seasonalPatterns.clear();
    
    // Initialize all categories
    transactions.forEach(transaction => {
      if (!this.seasonalPatterns.has(transaction.categoryId)) {
        this.seasonalPatterns.set(transaction.categoryId, new Map());
        
        // Initialize all months to 0
        for (let month = 0; month < 12; month++) {
          this.seasonalPatterns.get(transaction.categoryId)!.set(month, 0);
        }
      }
    });
    
    // Process transactions
    transactions.forEach(transaction => {
      if (!transaction.date) return;
      
      const date = new Date(transaction.date);
      const month = date.getMonth();
      
      // Skip if invalid date
      if (isNaN(date.getTime())) return;
      
      const categoryMap = this.seasonalPatterns.get(transaction.categoryId);
      if (categoryMap) {
        // Increment count for this month
        categoryMap.set(month, (categoryMap.get(month) || 0) + 1);
      }
    });
    
    // Normalize patterns for each category
    this.seasonalPatterns.forEach((monthMap, categoryId) => {
      const total = Array.from(monthMap.values()).reduce((sum, count) => sum + count, 0);
      
      if (total > 0) {
        monthMap.forEach((count, month) => {
          monthMap.set(month, count / total);
        });
      }
    });
  }
  
  predict(description: string, date?: string): { categoryId: string, confidence: number } {
    if (!this.trained) {
      throw new Error("Model has not been trained yet");
    }
    
    // Get merchant-based prediction
    const merchantPrediction = this.predictByMerchant(description);
    
    // If merchant prediction is highly confident, return it
    if (merchantPrediction && merchantPrediction.confidence > 0.8) {
      return merchantPrediction;
    }
    
    // Get content-based prediction
    const contentPrediction = this.predictByContent(description);
    
    // Get seasonal prediction if date is provided
    let seasonalBoost = new Map<string, number>();
    if (date) {
      seasonalBoost = this.getSeasonalBoost(date);
    }
    
    // Combine predictions with weights
    const finalScores = new Map<string, number>();
    
    // Start with content prediction (base prediction)
    this.categories.forEach((_, categoryId) => {
      finalScores.set(categoryId, 0);
    });
    
    // Add merchant prediction with high weight if available
    if (merchantPrediction) {
      finalScores.set(
        merchantPrediction.categoryId, 
        (finalScores.get(merchantPrediction.categoryId) || 0) + merchantPrediction.confidence * 3
      );
    }
    
    // Add content prediction with medium weight
    finalScores.set(
      contentPrediction.categoryId,
      (finalScores.get(contentPrediction.categoryId) || 0) + contentPrediction.confidence * 2
    );
    
    // Add seasonal boost with low weight
    seasonalBoost.forEach((boost, categoryId) => {
      finalScores.set(
        categoryId,
        (finalScores.get(categoryId) || 0) + boost * 1
      );
    });
    
    // Find best category
    let bestCategoryId = '';
    let bestScore = -Infinity;
    
    finalScores.forEach((score, categoryId) => {
      if (score > bestScore) {
        bestScore = score;
        bestCategoryId = categoryId;
      }
    });
    
    // Calculate confidence as normalized score
    let totalScore = 0;
    finalScores.forEach(score => totalScore += Math.max(0, score));
    
    const confidence = totalScore > 0 
      ? Math.min(1, Math.max(0, finalScores.get(bestCategoryId) || 0) / totalScore) 
      : contentPrediction.confidence;
    
    return {
      categoryId: bestCategoryId || contentPrediction.categoryId,
      confidence
    };
  }
  
  // Predict based on merchant name pattern
  private predictByMerchant(description: string): { categoryId: string, confidence: number } | null {
    const merchant = this.extractMerchantName(description);
    if (!merchant || !this.merchantToCategory.has(merchant)) {
      return null;
    }
    
    const categoryMap = this.merchantToCategory.get(merchant)!;
    if (categoryMap.size === 0) {
      return null;
    }
    
    // Find most frequent category for this merchant
    let bestCategoryId = '';
    let bestCount = 0;
    let totalCount = 0;
    
    categoryMap.forEach((count, categoryId) => {
      totalCount += count;
      if (count > bestCount) {
        bestCount = count;
        bestCategoryId = categoryId;
      }
    });
    
    // Calculate confidence based on frequency
    const confidence = totalCount > 0 ? bestCount / totalCount : 0;
    
    return {
      categoryId: bestCategoryId,
      confidence: confidence
    };
  }
  
  // Predict based on content using TF-IDF
  private predictByContent(description: string): { categoryId: string, confidence: number } {
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
    
    // Convert score to confidence value
    let totalScore = 0;
    scores.forEach(score => totalScore += Math.max(0, score));
    
    const confidence = totalScore > 0 ? Math.max(0, bestScore) / totalScore : 0;
    
    return {
      categoryId: bestCategoryId || Array.from(this.categories.keys())[0], // Fallback to first category
      confidence
    };
  }
  
  // Get seasonal boost factors based on the date
  private getSeasonalBoost(dateStr: string): Map<string, number> {
    const boost = new Map<string, number>();
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return boost;
      
      const month = date.getMonth();
      
      // Apply seasonal patterns
      this.seasonalPatterns.forEach((monthMap, categoryId) => {
        const seasonalFactor = monthMap.get(month) || 0;
        boost.set(categoryId, seasonalFactor);
      });
    } catch (e) {
      // Ignore date parsing errors
    }
    
    return boost;
  }
  
  addFeedback(description: string, actualCategoryId: string, date?: string): void {
    this.feedbackData.push({ description, actualCategoryId, date });
  }
  
  // Learn from user feedback and improve the model
  retrainWithFeedback(transactions: Transaction[], categories: Category[]): void {
    if (this.feedbackData.length === 0) return;
    
    // Create augmented transactions with feedback data
    const feedbackTransactions: Transaction[] = this.feedbackData.map((feedback, index) => ({
      id: `feedback-${index}`,
      date: feedback.date || new Date().toISOString(),
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
      const prediction = this.predict(transaction.description, transaction.date);
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