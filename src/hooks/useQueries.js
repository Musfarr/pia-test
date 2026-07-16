import { useQuery } from '@tanstack/react-query';
import { getCategories, getJuries } from '../util/api';

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
