import { useQuery } from '@tanstack/react-query';
import { getCategories, getJuries, getNominees, getNominee, getNomineeData, getMyNominees, getMyScore } from '../util/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
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
