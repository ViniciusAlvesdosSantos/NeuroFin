import { z } from 'zod';
import { isValidCPF, isValidEmail } from './formatters';

export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z
    .string()
    .refine(isValidEmail, 'Email inválido'),
  cpf: z
    .string()
    .refine(isValidCPF, 'CPF inválido'),
  phone: z
    .string()
    .min(14, 'Telefone deve ter pelo menos 14 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Deve conter maiúscula, minúscula e número')
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email ou CPF é obrigatório'),
});

export const loginPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email ou CPF é obrigatório'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const setPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Deve conter maiúscula, minúscula e número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

export const verifyOtpSchema = z.object({
  otpCode: z
    .string()
    .length(6, 'Código OTP deve ter 6 dígitos'),
});

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome da conta deve ter pelo menos 3 caracteres')
    .max(50, 'Nome da conta deve ter no máximo 50 caracteres'),
  color: z.string().min(1, 'Selecione uma cor'),
  icon: z.string().min(1, 'Selecione um ícone'),
  balance: z
    .string()
    .regex(/^\d{1,15}(\.\d{1,3})?$/, 'Valor inválido')
    .optional()
    .default('0'),
});

export const createTransactionSchema = z.object({
  description: z
    .string()
    .min(1, 'Descrição é obrigatória'),
  amount: z
    .number()
    .positive('Valor deve ser positivo'),
  date: z
    .string()
    .min(1, 'Data é obrigatória'),
  type: z
    .string()
    .min(1, 'Tipo é obrigatório'),
  categoryId: z.string().optional(),
  accountId: z
    .string()
    .min(1, 'Conta é obrigatória'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório'),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z
    .string()
    .min(1, 'Tipo é obrigatório'),
});

export const createInvestmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório'),
  type: z
    .string()
    .min(1, 'Tipo é obrigatório'),
  initialValue: z
    .number()
    .positive('Valor inicial deve ser positivo'),
  currentValue: z
    .number()
    .positive('Valor atual deve ser positivo'),
  profitability: z
    .number()
    .optional(),
  dueDate: z.string().optional(),
  accountId: z
    .string()
    .min(1, 'Conta é obrigatória'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginPasswordFormData = z.infer<typeof loginPasswordSchema>;
export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type CreateInvestmentFormData = z.infer<typeof createInvestmentSchema>;
