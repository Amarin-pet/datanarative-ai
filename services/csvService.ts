import Papa from 'papaparse';
import { CSVAnalysis, CSVRow, MonthlyTrend, CategoryStat } from '../types';

// Heuristic to find a date column
const isDateColumn = (sample: string): boolean => {
  return !isNaN(Date.parse(sample)) && sample.length > 4;
};

// Heuristic to find an amount column (looks for numbers, ignores IDs usually)
const isAmountColumn = (key: string, sample: string): boolean => {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('id') || lowerKey.includes('code') || lowerKey.includes('year')) return false;
  // Check if string is a valid number
  const num = parseFloat(sample.toString().replace(/,/g, ''));
  return !isNaN(num);
};

export const parseAndAnalyzeCSV = (file: File): Promise<CSVAnalysis> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && !results.data) {
          reject(new Error("Error parsing CSV file."));
          return;
        }

        const data = results.data as CSVRow[];
        if (data.length === 0) {
          reject(new Error("CSV file is empty."));
          return;
        }

        const headers = Object.keys(data[0]);
        const firstRow = data[0];

        // 1. Identify Columns
        let dateCol = headers.find(h => /date|posting|day|month/i.test(h)) || '';
        let amountCol = headers.find(h => /amount|net|gross|value|cost|price/i.test(h) && !/currency/i.test(h)) || '';
        let catCol = headers.find(h => /ba|business|area|category|dept|department|center/i.test(h)) || '';

        // Fallback heuristics if regex failed
        if (!dateCol || !amountCol || !catCol) {
            for (const key of headers) {
                const val = String(firstRow[key]);
                if (!dateCol && isDateColumn(val)) dateCol = key;
                else if (!amountCol && isAmountColumn(key, val)) amountCol = key;
                else if (!catCol && val.length > 2 && isNaN(Number(val))) catCol = key; 
            }
        }
        
        // If still failing, default to first few
        if (!amountCol) amountCol = headers.find(h => !isNaN(parseFloat(String(firstRow[h])))) || headers[0];
        if (!catCol) catCol = headers.find(h => h !== amountCol && h !== dateCol) || headers[1];


        // 2. Calculate Stats
        let totalAmount = 0;
        const monthlyAgg: Record<string, number> = {};
        const categoryAgg: Record<string, { value: number; count: number }> = {};

        data.forEach(row => {
          // Amount
          let val = row[amountCol];
          let numVal = 0;
          if (typeof val === 'number') numVal = val;
          else if (typeof val === 'string') numVal = parseFloat(val.replace(/,/g, ''));
          
          if (!isNaN(numVal)) {
            totalAmount += numVal;

            // Date Trend
            if (dateCol && row[dateCol]) {
               try {
                 const d = new Date(String(row[dateCol]));
                 // Key format: YYYY-MM
                 const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                 monthlyAgg[key] = (monthlyAgg[key] || 0) + numVal;
               } catch (e) { /* ignore bad dates */ }
            }

            // Category
            if (catCol) {
                const cat = String(row[catCol] || 'Unknown');
                if (!categoryAgg[cat]) categoryAgg[cat] = { value: 0, count: 0 };
                categoryAgg[cat].value += numVal;
                categoryAgg[cat].count += 1;
            }
          }
        });

        // 3. Format Results
        const monthlyTrend: MonthlyTrend[] = Object.entries(monthlyAgg)
          .map(([month, amount]) => ({ month, amount }))
          .sort((a, b) => a.month.localeCompare(b.month));

        const topCategories: CategoryStat[] = Object.entries(categoryAgg)
          .map(([name, stats]) => ({ name, value: stats.value, count: stats.count }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10); // Top 10

        resolve({
          filename: file.name,
          rowCount: data.length,
          totalAmount,
          columnHeaders: headers,
          monthlyTrend,
          topCategories,
          amountColumnName: amountCol,
          categoryColumnName: catCol,
          dateColumnName: dateCol || 'N/A'
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
