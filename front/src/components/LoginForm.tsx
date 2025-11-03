import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../contexts/AuthContext';
import TwoFactorForm from './TwoFactorForm';
import { Box, Card, CardContent, Typography, Button, Alert, Stack } from '@mui/material';
import FormField from './FormField';
import { loginSchema, LoginFormData } from '../schemas/authSchema';

const LoginForm: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setLoading(true);

    try {
      console.log('LoginForm: Attempting login...');
      const response = await login(data.email, data.password);
      console.log('LoginForm: Login response:', response);
      
      if (response.requiresTwoFactor && response.userId) {
        console.log('LoginForm: 2FA required, showing 2FA form');
        setRequires2FA(true);
        setUserId(response.userId);
      } else if (response.token && response.user) {
        if (response.user.twoFactorEnabled) {
          navigate('/dashboard');
        } else {
          navigate('/profile');
        }
      }
    } catch (err: any) {
      console.log('LoginForm: Login error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (requires2FA && userId) {
    return (
      <TwoFactorForm 
        userId={userId} 
        onBack={() => {
          setRequires2FA(false);
          setUserId(null);
        }}
      />
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, background: 'linear-gradient(135deg,rgb(102, 208, 234) 0%,rgb(81, 87, 243) 100%)' }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>🔐 Login</Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <FormField
                name="email"
                control={control}
                label="Email"
                type="email"
                required
                disabled={loading}
                autoComplete="email"
                placeholder="Enter your email"
                fullWidth
              />
              <FormField
                name="password"
                control={control}
                label="Password"
                type="password"
                required
                disabled={loading}
                autoComplete="current-password"
                placeholder="Enter your password"
                fullWidth
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !isValid}
                fullWidth
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Two-Factor Authentication enabled for security
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;