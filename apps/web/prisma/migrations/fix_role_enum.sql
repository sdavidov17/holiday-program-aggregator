-- Fix role field type mismatch
-- This converts enum to text type if it exists

-- First, check if role is an enum and convert to text
DO $$ 
BEGIN
    -- Check if the column exists and is an enum
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'role'
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- Convert enum to text, preserving values
        ALTER TABLE "User" 
        ALTER COLUMN role TYPE TEXT 
        USING role::TEXT;
    END IF;
END $$;

-- Ensure the column has the correct default
ALTER TABLE "User" ALTER COLUMN role SET DEFAULT 'USER';

-- Update any null values to USER
UPDATE "User" SET role = 'USER' WHERE role IS NULL;

-- Ensure role is not null
ALTER TABLE "User" ALTER COLUMN role SET NOT NULL;

-- Add check constraint for valid roles (optional but recommended)
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS user_role_check;
ALTER TABLE "User" ADD CONSTRAINT user_role_check 
  CHECK (role IN ('USER', 'ADMIN'));