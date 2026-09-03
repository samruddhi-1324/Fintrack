import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi, SetBudgetPayload } from '../services/budgetApi';

export function useBudgets(category_id?: string) {
  const queryClient = useQueryClient();

  const budgetsQuery = useQuery({
    queryKey: ['budgets'],
    queryFn: budgetApi.getBudgets
  });

  const budgetStatusQuery = useQuery({
    queryKey: ['budget-status', category_id],
    queryFn: () => budgetApi.getBudgetStatus(category_id)
  });

  const dailyStatusQuery = useQuery({
    queryKey: ['daily-status'],
    queryFn: budgetApi.getDailyLimitStatus
  });

  const setBudgetMutation = useMutation({
    mutationFn: (payload: SetBudgetPayload) => budgetApi.setBudget(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });
      queryClient.invalidateQueries({ queryKey: ['daily-status'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-forecast'] });
    }
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: string) => budgetApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });
      queryClient.invalidateQueries({ queryKey: ['daily-status'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-forecast'] });
    }
  });

  return {
    budgets: budgetsQuery.data || [],
    budgetStatus: budgetStatusQuery.data,
    dailyStatus: dailyStatusQuery.data,
    isLoading: budgetsQuery.isLoading || budgetStatusQuery.isLoading || dailyStatusQuery.isLoading,
    isError: budgetsQuery.isError || budgetStatusQuery.isError || dailyStatusQuery.isError,
    setBudget: setBudgetMutation.mutateAsync,
    isSetting: setBudgetMutation.isPending,
    deleteBudget: deleteBudgetMutation.mutateAsync,
    isDeleting: deleteBudgetMutation.isPending
  };
}
