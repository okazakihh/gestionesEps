import { useSelector } from 'react-redux';
import { useAppDispatch } from './useAppDispatch';
import { fetchPacientes, setSearchParams, clearError } from '@/presentacion/stores/pacientesSlice.js';

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
  } = useSelector((state) => state.pacientes);

  const loadPacientes = (params) => {
    const finalParams = { ...searchParams, ...params };
    dispatch(fetchPacientes(finalParams));
  };

  const updateSearchParams = (params) => {
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