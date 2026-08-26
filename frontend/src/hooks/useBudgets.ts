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

  const setBudgetMutation = useMutation({
    mutationFn: (payload: SetBudgetPayload) => budgetApi.setBudget(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: string) => budgetApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  return {
    budgets: budgetsQuery.data || [],
    budgetStatus: budgetStatusQuery.data,
    isLoading: budgetsQuery.isLoading || budgetStatusQuery.isLoading,
    isError: budgetsQuery.isError || budgetStatusQuery.isError,
    setBudget: setBudgetMutation.mutateAsync,
    isSetting: setBudgetMutation.isPending,
    deleteBudget: deleteBudgetMutation.mutateAsync,
    isDeleting: deleteBudgetMutation.isPending
  };
}
