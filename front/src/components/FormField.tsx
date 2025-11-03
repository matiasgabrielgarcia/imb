import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'name'> {
  name: FieldPath<T>;
  control: Control<T>;
  helperText?: string;
}

const FormField = <T extends FieldValues>({
  name,
  control,
  helperText,
  ...textFieldProps
}: FormFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          error={!!error}
          helperText={error?.message || helperText}
          value={field.value || ''}
          fullWidth
        />
      )}
    />
  );
};

export default FormField;
