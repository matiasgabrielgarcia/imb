import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { TwoFactorService } from '../services/twoFactorService';
// import { EmailService } from '../services/emailService';
import { query } from '../database/connection';

const router = Router();

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

//  const firstUser = await UserModel.findById(1);
//    console.log('firstUser', firstUser);

    console.log('trying to find username', username)

    // Find user
    const user = await UserModel.findByUsername(username);

    

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }


    console.log('username ok ', user);

    // Verify password
    const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('pass ok ');

    // Log login attempt
    await query(
      'INSERT INTO login_attempts (user_id, ip_address, success) VALUES ($1, $2, $3)',
      [user.id, req.ip, true]
    );

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Return user info but require 2FA verification
      return res.status(200).json({
        message: 'Password verified, 2FA required',
        userId: user.id,
        requiresTwoFactor: true
      });
    }
    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET environment variable is not set!");
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const signOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    } as SignOptions;
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      jwtSecret,
      signOptions
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.two_factor_enabled
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error stack:', error?.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
});

// Verify 2FA token
router.post('/verify-2fa', async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    console.log(" api/auth/verify-2fa   ", userId, token);
    if (!userId || !token) {
      return res.status(400).json({ error: 'User ID and token are required' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("before isValidToken")

    // Verify TOTP token
    const isValidToken = await TwoFactorService.verifyTwoFactor(userId, token);
    
    console.log("wwwwwwwisValidTokenisValidTokenisValidTokenwwwwwwooow", isValidToken)
    if (isValidToken) {
      // Generate JWT token
      console.log(" Generate JWT token")
      
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("JWT_SECRET environment variable is not set!");
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      const signOptions = {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      } as SignOptions;
      const jwtToken = jwt.sign(
        { userId: user.id, username: user.username },
        jwtSecret,
        signOptions
      );

      console.log(" JWT token OK  " , jwtToken)

      return res.json({
        message: '2FA verification successful',
        token: jwtToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          twoFactorEnabled: user.two_factor_enabled
        }
      });
    }


    console.log("wwwwwwwwwwwwwooow")
    // Try backup code verification
    const isValidBackupCode = await TwoFactorService.verifyBackupCode(userId, token);

    console.log("wwwwwwwwwwwwwooow2")
    if (isValidBackupCode) {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("JWT_SECRET environment variable is not set!");
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      const signOptions = {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      } as SignOptions;
      const jwtToken = jwt.sign(
        { userId: user.id, username: user.username },
        jwtSecret,
        signOptions
      );

      return res.json({
        message: 'Backup code verification successful',
        token: jwtToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          twoFactorEnabled: user.two_factor_enabled
        }
      });
    }

    res.status(401).json({ error: 'Invalid 2FA token or backup code' });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup 2FA for user
router.post('/setup-2fa', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("user found 2f")

    const appName = process.env.APP_NAME || '2FA Authentication App';
    const setupData = await TwoFactorService.setupTwoFactor(userId, user.username, appName);

    res.json({
      message: '2FA setup successful',
      qrCode: setupData.qrCodeDataUrl,
      secret: setupData.secret,
      backupCodes: setupData.backupCodes
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send email verification code
router.post('/send-email-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code temporarily (in production, use Redis or similar)
    // For now, we'll just send the email
    const emailSent = false// await EmailService.sendVerificationCode(email, code);
    
    if (emailSent) {
      res.json({ message: 'Verification code sent to email' });
    } else {
      res.status(500).json({ error: 'Failed to send verification code' });
    }

  } catch (error) {
    console.error('Email code sending error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify email code
router.post('/verify-email-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // In production, verify the code from your temporary storage
    // For demo purposes, we'll accept any 6-digit code
    if (code.length === 6 && /^\d+$/.test(code)) {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("JWT_SECRET environment variable is not set!");
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      const signOptions = {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      } as SignOptions;
      const jwtToken = jwt.sign(
        { userId: user.id, username: user.username },
        jwtSecret,
        signOptions
      );

      return res.json({
        message: 'Email verification successful',
        token: jwtToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          twoFactorEnabled: user.two_factor_enabled
        }
      });
    }

    res.status(401).json({ error: 'Invalid verification code' });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
