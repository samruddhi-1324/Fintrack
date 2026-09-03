import { fetchApi } from './api';
import {
  CategorizeResponse,
  NaturalLanguageExpenseResponse,
  AIInsightsResponse,
  ExpenseForecastResponse,
  FinancialHealthScoreResponse
} from '../types/ai';

export const aiApi = {
  categorize: (title: string) =>
    fetchApi<CategorizeResponse>('/ai/categorize', {
      method: 'POST',
      body: JSON.stringify({ title })
    }),

  getInsights: () =>
    fetchApi<AIInsightsResponse>('/ai/insights', {
      method: 'GET'
    }),

  getForecast: () =>
    fetchApi<ExpenseForecastResponse>('/ai/forecast', {
      method: 'GET'
    }),

  getHealthScore: () =>
    fetchApi<FinancialHealthScoreResponse>('/ai/health-score', {
      method: 'GET'
    }),

  parseExpenseNLP: (text: string) =>
    fetchApi<NaturalLanguageExpenseResponse>('/ai/parse-expense', {
      method: 'POST',
      body: JSON.stringify({ text })
    })
};


