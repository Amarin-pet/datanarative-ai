export interface CSVRow {
  [key: string]: string | number | undefined;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
}

export interface CategoryStat {
  name: string;
  value: number;
  count: number;
}

export interface CSVAnalysis {
  filename: string;
  rowCount: number;
  totalAmount: number;
  columnHeaders: string[];
  monthlyTrend: MonthlyTrend[];
  topCategories: CategoryStat[];
  amountColumnName: string;
  categoryColumnName: string;
  dateColumnName: string;
}
