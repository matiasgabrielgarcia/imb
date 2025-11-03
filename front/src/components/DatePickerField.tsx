import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

interface DatePickerFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  helperText?: string;
}

const DatePickerField = <T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  helperText,
}: DatePickerFieldProps<T>) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            label={label}
            value={field.value ? dayjs(field.value) : null}
            onChange={(date: Dayjs | null) => {
              field.onChange(date ? date.toDate() : null);
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                required,
                error: !!error,
                helperText: error?.message || helperText,
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default DatePickerField;
