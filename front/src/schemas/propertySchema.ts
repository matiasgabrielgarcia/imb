import * as yup from 'yup';

export const propertySchema = yup.object({
  numero: yup
    .string()
    .required('El número es requerido')
    .trim(),
  direccion: yup
    .string()
    .required('La dirección es requerida')
    .trim(),
  cliente: yup
    .string()
    .required('El cliente es requerido')
    .trim(),
  fecha: yup
    .date()
    .required('La fecha es requerida')
    .typeError('La fecha debe ser válida'),
  rev: yup
    .string()
    .required('La revisión es requerida')
    .trim(),
  m2: yup
    .number()
    .required('Los m² son requeridos')
    .positive('Los m² deben ser un número positivo')
    .integer('Los m² deben ser un número entero'),
  latitude: yup
    .number()
    .required('La latitud es requerida')
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90'),
  longitude: yup
    .number()
    .required('La longitud es requerida')
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180'),
  dni: yup
    .string()
    .nullable()
    .optional()
    .trim()
    .test('dni-format', 'El DNI debe tener entre 7 y 8 dígitos numéricos', function(value) {
      if (!value || value.trim() === '') return true; // Opcional, puede estar vacío
      return /^[0-9]{7,8}$/.test(value);
    }),
});

export type PropertyFormData = yup.InferType<typeof propertySchema>;
