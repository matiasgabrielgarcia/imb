import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    // .email('Debe ser un email válido')
    .required('El email es requerido')
    .trim(),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(3, 'La contraseña debe tener al menos 3 caracteres'),
});

export const twoFactorSchema = yup.object({
  code: yup
    .string()
    .required('El código es requerido')
    .length(6, 'El código debe tener 6 dígitos')
    .matches(/^\d+$/, 'El código debe contener solo números'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type TwoFactorFormData = yup.InferType<typeof twoFactorSchema>;
