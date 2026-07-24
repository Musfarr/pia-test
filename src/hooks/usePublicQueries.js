import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  voterRegister,
  voterVerifyOtp,
  voterLogin,
  getPublicCategories,
  getPublicShortlist,
  castVote,
  getMyVotes,
} from '../util/publicApi';

// ── Auth mutations ──
export const useVoterRegister = () => {
  return useMutation({ mutationFn: voterRegister });
};

export const useVoterVerifyOtp = () => {
  return useMutation({ mutationFn: voterVerifyOtp });
};

export const useVoterLogin = () => {
  return useMutation({ mutationFn: voterLogin });
};

// ── Categories ──
export const usePublicCategories = () => {
  return useQuery({
    queryKey: ['public-categories'],
    queryFn: getPublicCategories,
  });
};

// ── Category Shortlist ──
export const usePublicShortlist = (categoryId) => {
  return useQuery({
    queryKey: ['public-shortlist', categoryId],
    queryFn: () => getPublicShortlist(categoryId),
    enabled: !!categoryId,
  });
};

// ── Cast Vote ──
export const useCastVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: castVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-shortlist'] });
      queryClient.invalidateQueries({ queryKey: ['my-votes'] });
    },
  });
};

// ── My Votes ──
export const useMyVotes = () => {
  return useQuery({
    queryKey: ['my-votes'],
    queryFn: getMyVotes,
  });
};
