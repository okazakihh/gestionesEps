import { useSelector } from 'react-redux';
import { useAppDispatch } from './useAppDispatch';
import { RootState } from '../stores/store';
import { fetchPacientes, setSearchParams, clearError } from '../stores/pacientesSlice';

export const usePacientes = () => {
  const dispatch = useAppDispatch();
  const {
    pacientes,
    loading,
    error,
    connectionError,
    searchParams,
    totalPages,
    totalElements,
  } = useSelector((state: RootState) => state.pacientes);

  const loadPacientes = (params?: { page?: number; size?: number; search?: string }) => {
    const finalParams = { ...searchParams, ...params };
    dispatch(fetchPacientes(finalParams));
  };

  const updateSearchParams = (params: { page?: number; size?: number; search?: string }) => {
    dispatch(setSearchParams(params));
  };

  const clearPacientesError = () => {
    dispatch(clearError());
  };

  return {
    pacientes,
    loading,
    error,
    connectionError,
    searchParams,
    totalPages,
    totalElements,
    loadPacientes,
    updateSearchParams,
    clearPacientesError,
  };
};