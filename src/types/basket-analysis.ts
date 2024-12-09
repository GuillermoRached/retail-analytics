export interface ProductCombination {
    department1: string;
    department2: string;
    support: number;
    confidence: number;
    lift: number;
  }
  
  export interface DepartmentRecommendation {
    department: string;
    support: number;
    confidence: number;
  }
  
  export interface BasketAnalysisResult {
    productCombinations: ProductCombination[];
    topRecommendations: Record<string, DepartmentRecommendation[]>;
    modelPerformance: {
      accuracy: number;
      departments: Record<string, number>;
    };
  }