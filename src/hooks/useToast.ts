import { toast } from 'sonner';

/**
 * A hook for displaying toast notifications
 * Wraps sonner's toast functionality
 */
export const useToast = () => {
  return {
    toast,
    success: (message, options = {}) =>
      toast.success(message, options),
    error: (message, options = {}) =>
      toast.error(message, options),
    warning: (message, options = {}) =>
      toast.warning(message, options),
    info: (message, options = {}) =>
      toast.info(message, options),
  };
};