-- Fix user pepe password
UPDATE users 
SET password_hash = '$2a$10$c3KB4/3mQSfZCvAqNQUxfubswupkqv2zr94qiaZ4RPNh9E6PradOi' 
WHERE username='pepe';

-- Verify
SELECT id, username, email, password_hash FROM users WHERE username='pepe';

