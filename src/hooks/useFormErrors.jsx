"use client";
// ============================================================================
// SECTION: HOOK - FORM ERRORS
// ============================================================================
import { useCallback } from "react";

export function useFormErrors(setFieldErrors) {
  const setFieldError = useCallback((field, message) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }, [setFieldErrors]);

  const clearFieldError = useCallback((field) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, [setFieldErrors]);

  return { setFieldError, clearFieldError };
}
