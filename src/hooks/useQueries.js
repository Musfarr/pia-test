import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, getAllCategories, setCategoryActive, getJuries, getNominees, getNominee, getNomineeData, getMyNominees, getMyScore, updateCategoryStage, getCategoryAdmins, createCategoryAdmin, deleteCategoryAdmin, getSettings, updateGlobalStage, getShortlists, getWithdrawnFinalists, updateFinalistConsent, getDashboardStats, getAuditLogs } from '../util/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
};

// Super Admin Categories page: active + switched-off categories
export const useAllCategories = () => {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories,
  });
};

// Switching a category hides/restores its nominees everywhere (and may rerun its
// shortlists), so refresh every cached view
export const useSetCategoryActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }) => setCategoryActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useJuries = () => {
  return useQuery({
    queryKey: ['juries'],
    queryFn: getJuries,
  });
};

export const useNominees = () => {
  return useQuery({
    queryKey: ['nominees'],
    queryFn: getNominees,
  });
};

export const useNominee = (id) => {
  return useQuery({
    queryKey: ['nominee', id],
    queryFn: () => getNominee(id),
    enabled: !!id,
  });
};

export const useNomineeData = (id) => {
  return useQuery({
    queryKey: ['nomineeData', id],
    queryFn: () => getNomineeData(id),
    enabled: !!id,
  });
};

export const useMyNominees = () => {
  return useQuery({
    queryKey: ['my-nominees'],
    queryFn: getMyNominees,
  });
};

export const useMyScore = (nomineeId) => {
  return useQuery({
    queryKey: ['my-score', nomineeId],
    queryFn: () => getMyScore(nomineeId),
    enabled: !!nomineeId,
  });
};

export const useUpdateCategoryStage = () => {
  return useMutation({
    mutationFn: ({ id, stage }) => updateCategoryStage(id, stage),
  });
};

// ── Global Settings / Stage ──
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });
};

export const useUpdateGlobalStage = () => {
  return useMutation({
    mutationFn: (currentStage) => updateGlobalStage(currentStage),
  });
};

export const useCategoryAdmins = () => {
  return useQuery({
    queryKey: ['category-admins'],
    queryFn: getCategoryAdmins,
  });
};

export const useCreateCategoryAdmin = () => {
  return useMutation({
    mutationFn: createCategoryAdmin,
  });
};

export const useDeleteCategoryAdmin = () => {
  return useMutation({
    mutationFn: deleteCategoryAdmin,
  });
};

// ── Shortlists ──
export const useShortlists = (stage) => {
  return useQuery({
    queryKey: ['shortlists', stage || 'all'],
    queryFn: () => getShortlists(stage),
  });
};

export const useWithdrawnFinalists = (enabled = true) => {
  return useQuery({
    queryKey: ['shortlists', 'withdrawn'],
    queryFn: getWithdrawnFinalists,
    enabled,
  });
};

// Declining consent reruns the Top 5 on the server, so refresh every shortlist view
export const useUpdateFinalistConsent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFinalistConsent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlists'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// ── Dashboard KPIs (role-aware) ──
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });
};

// ── Audit Logs ──
export const useAuditLogs = (filters = {}) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => getAuditLogs(filters),
    keepPreviousData: true,
  });
};
