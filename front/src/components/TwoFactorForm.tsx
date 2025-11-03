import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { Box, Card, CardContent, Typography, Button, Alert, Stack } from '@mui/material';
import FormField from './FormField';
import { twoFactorSchema, TwoFactorFormData } from '../schemas/authSchema';
import * as yup from 'yup';

interface TwoFactorFormProps {
  userId: number;
  onBack: () => void;
}

const emailSchema = yup.object({
  email: yup
    .string()
    .email('Debe ser un email válido')
    .required('El email es requerido')
    .trim(),
});

const TwoFactorForm: React.FC<TwoFactorFormProps> = ({ userId, onBack }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { verify2FA } = useAuth();
  const navigate = useNavigate();

  // Token form
  const tokenForm = useForm<TwoFactorFormData>({
    resolver: yupResolver(twoFactorSchema),
    mode: 'onBlur',
    defaultValues: {
      code: '',
    }
  });

  // Email form
  const emailForm = useForm<{ email: string }>({
    resolver: yupResolver(emailSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
    }
  });

  const handleTokenSubmit = async (data: TwoFactorFormData) => {
    setError('');
    setLoading(true);

    try {
      const response = await verify2FA(userId, data.code);
      if (response.token && response.user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (data: { email: string }) => {
    setError('');
    setLoading(true);

    try {
      if (!emailSent) {
        await authAPI.sendEmailCode(data.email);
        setEmailSent(true);
        emailForm.reset({ email: data.email });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailCodeSubmit = async (data: TwoFactorFormData) => {
    setError('');
    setLoading(true);

    try {
      const email = emailForm.getValues('email');
      const response = await authAPI.verifyEmailCode(email, data.code);
      if (response.token && response.user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>🔒 Two-Factor Authentication</Typography>
          {!useEmail ? (
            <Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Enter the 6-digit code from your authenticator app:
              </Typography>
              <Box component="form" onSubmit={tokenForm.handleSubmit(handleTokenSubmit)} noValidate>
                <Stack spacing={2}>
                  <FormField
                    name="code"
                    control={tokenForm.control}
                    label="Authentication Code"
                    required
                    disabled={loading}
                    placeholder="000000"
                    inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                    fullWidth
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={loading || !tokenForm.formState.isValid}
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </Button>
                    <Button variant="outlined" onClick={onBack}>Back to Login</Button>
                  </Stack>
                </Stack>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Don't have your authenticator app?
                </Typography>
                <Button variant="outlined" onClick={() => setUseEmail(true)}>Use Email Instead</Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {emailSent ? 'Enter the 6-digit code sent to your email:' : 'Enter your email address to receive a verification code:'}
              </Typography>
              {!emailSent ? (
                <Box component="form" onSubmit={emailForm.handleSubmit(handleEmailSubmit)} noValidate>
                  <Stack spacing={2}>
                    <FormField
                      name="email"
                      control={emailForm.control}
                      label="Email Address"
                      type="email"
                      required
                      disabled={loading}
                      placeholder="your@email.com"
                      fullWidth
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading || !emailForm.formState.isValid}
                      >
                        {loading ? 'Sending...' : 'Send Code'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setUseEmail(false);
                          setEmailSent(false);
                          emailForm.reset();
                        }}
                      >
                        Back to Authenticator
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ) : (
                <Box component="form" onSubmit={tokenForm.handleSubmit(handleEmailCodeSubmit)} noValidate>
                  <Stack spacing={2}>
                    <FormField
                      name="code"
                      control={tokenForm.control}
                      label="Verification Code"
                      required
                      disabled={loading}
                      placeholder="000000"
                      inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                      fullWidth
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading || !tokenForm.formState.isValid}
                      >
                        {loading ? 'Verifying...' : 'Verify Code'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setUseEmail(false);
                          setEmailSent(false);
                          emailForm.reset();
                          tokenForm.reset();
                        }}
                      >
                        Back to Authenticator
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TwoFactorForm;