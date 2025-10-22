import { useState } from "react";
import { z } from "zod";

type ErrorMap = Record<string, string>;

export function useFormValidation<TSchema extends z.ZodTypeAny>(
  schema: TSchema
) {
  const [errors, setErrors] = useState<ErrorMap>({});

  const formatIssues = (issues: z.ZodIssue[]): ErrorMap => {
    const formatted: ErrorMap = {};

    for (const issue of issues) {
      const key = issue.path.join(".");

      formatted[key || "_root"] = issue.message;
    }
    return formatted;
  };

  const validate = (data: unknown): data is z.infer<TSchema> => {
    const result = schema.safeParse(data);

    if (result.success) {
      setErrors({});

      return true;
    }

    setErrors(formatIssues(result.error.issues));

    return false;
  };

  const validateField = (fieldName: string, _value: unknown, data: unknown) => {
    const result = schema.safeParse(data);

    if (result.success) {
      setErrors((prev) => {
        const next = { ...prev };

        delete next[fieldName];

        return next;
      });

      return;
    }

    const issues = result.error.issues;

    const fieldIssue = issues.find((i) => i.path.join(".") === fieldName);

    if (fieldIssue) {
      setErrors((prev) => ({ ...prev, [fieldName]: fieldIssue.message }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };

        delete next[fieldName];

        return next;
      });
    }
  };

  const clearErrors = () => setErrors({});

  const clearFieldError = (fieldName: string) =>
    setErrors((prev) => {
      const next = { ...prev };

      delete next[fieldName];

      return next;
    });

  const getError = (fieldName: string) => errors[fieldName];

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    getError,
  };
}
