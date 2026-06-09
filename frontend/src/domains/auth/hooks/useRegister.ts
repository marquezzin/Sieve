import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
import type { RegisterCredentials, TokenResponse } from '../types';

export function useRegister() {
  const navigate = useNavigate();

  return useMutation<TokenResponse, Error, RegisterCredentials>({
    mutationFn: register,
    onSuccess: () => {
      navigate('/', { replace: true });
    },
  });
}
