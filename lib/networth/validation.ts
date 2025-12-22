/**
 * Net Worth Validation Schemas
 *
 * Zod schemas for validating form inputs and API payloads.
 */

import { z } from "zod"

/**
 * PIN validation schema
 */
export const pinSchema = z.object({
  pin: z
    .string()
    .min(4, "PIN must be at least 4 digits")
    .max(6, "PIN must be at most 6 digits")
    .regex(/^\d+$/, "PIN must contain only numbers"),
})

/**
 * Income source validation schema
 */
export const incomeSourceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(10000000, "Amount seems unrealistically high"),
  frequency: z.enum(["biweekly", "monthly", "annual", "one_time"], {
    required_error: "Please select a frequency",
  }),
})

/**
 * Asset validation schema
 */
export const assetSchema = z.object({
  category: z.enum(["cash", "investments", "property", "vehicles", "other"], {
    required_error: "Please select a category",
  }),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  value: z
    .number()
    .nonnegative("Value must be zero or positive")
    .max(1000000000, "Value seems unrealistically high"),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional().nullable(),
})

/**
 * Liability validation schema
 */
export const liabilitySchema = z.object({
  category: z.enum(
    ["credit_card", "student_loan", "mortgage", "auto_loan", "personal_loan", "other"],
    {
      required_error: "Please select a category",
    }
  ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  balance: z
    .number()
    .nonnegative("Balance must be zero or positive")
    .max(100000000, "Balance seems unrealistically high"),
  interestRate: z
    .number()
    .min(0, "Interest rate must be zero or positive")
    .max(100, "Interest rate cannot exceed 100%")
    .optional()
    .nullable(),
  minimumPayment: z
    .number()
    .nonnegative("Minimum payment must be zero or positive")
    .optional()
    .nullable(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional().nullable(),
})

/**
 * Monthly expense override validation schema
 */
export const expenseOverrideSchema = z.object({
  amount: z
    .number()
    .nonnegative("Amount must be zero or positive")
    .max(1000000, "Amount seems unrealistically high"),
  useOverride: z.boolean(),
})

/**
 * Budget allocation percentages validation
 * Must sum to 100%
 */
export const budgetAllocationSchema = z
  .object({
    needs: z.number().min(0).max(100),
    wants: z.number().min(0).max(100),
    savings: z.number().min(0).max(100),
  })
  .refine((data) => data.needs + data.wants + data.savings === 100, {
    message: "Percentages must sum to 100%",
    path: ["savings"], // Show error on last field
  })

/**
 * Type exports for form validation
 */
export type PinInput = z.infer<typeof pinSchema>
export type IncomeSourceInput = z.infer<typeof incomeSourceSchema>
export type AssetInput = z.infer<typeof assetSchema>
export type LiabilityInput = z.infer<typeof liabilitySchema>
export type ExpenseOverrideInput = z.infer<typeof expenseOverrideSchema>
export type BudgetAllocationInput = z.infer<typeof budgetAllocationSchema>
