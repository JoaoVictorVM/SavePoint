// Mock global do react-hot-toast.
// Captura chamadas a toast.success/error/etc para asserts nos testes.
const success = jest.fn();
const error = jest.fn();
const loading = jest.fn();
const dismiss = jest.fn();
const custom = jest.fn();

const toast = Object.assign(jest.fn(), {
  success,
  error,
  loading,
  dismiss,
  custom,
});

export const Toaster = () => null;

export default toast;
