import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/dashboardApi';

export function useDashboard() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.getSummary
  });

  const momQuery = useQuery({
    queryKey: ['dashboard', 'mom'],
    queryFn: dashboardApi.getMoMComparison
  });

  return {
    summary: summaryQuery.data,
    mom: momQuery.data,
    isLoading: summaryQuery.isLoading || momQuery.isLoading,
    isError: summaryQuery.isError || momQuery.isError,
    error: summaryQuery.error || momQuery.error,
    refetch: () => {
      summaryQuery.refetch();
      momQuery.refetch();
    }
  };
}
