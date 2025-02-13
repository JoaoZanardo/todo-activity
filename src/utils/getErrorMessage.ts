export const getErrorMessage = (error: any): string => {
  return error?.response?.data?.message ||
    error?.response?.message ||
    error?.message ||
    'Erro desconhecido'
}
