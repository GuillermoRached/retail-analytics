// This interface represents the raw data we get from our SQL query
export interface DashboardSummaryResult {
    totalHouseholds: number;
    totalTransactions: number;
    averageSpend: number;
    householdNumbers: string;  // This comes as a comma-separated string from SQL
  }
  
  // This interface represents the processed data we send to the frontend
  export interface DashboardSummary {
    totalHouseholds: number;
    totalTransactions: number;
    averageSpend: number;
    householdNumbers: number[];  // We convert the string to an array of numbers
  }