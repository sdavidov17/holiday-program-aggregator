-- Fix for role and status ENUM type mismatch
-- This converts PostgreSQL ENUMs to TEXT to match Prisma schema

-- Convert User.role from ENUM to TEXT
DO $$ 
BEGIN
    -- Check if role is an ENUM type
    IF EXISTS (
        SELECT 1 
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'Role'
    ) THEN
        -- Convert the column to TEXT
        ALTER TABLE "User" 
        ALTER COLUMN role TYPE TEXT 
        USING role::TEXT;
        
        -- Drop the ENUM type
        DROP TYPE IF EXISTS "Role" CASCADE;
        
        RAISE NOTICE 'Converted User.role from ENUM to TEXT';
    ELSE
        RAISE NOTICE 'User.role is already TEXT';
    END IF;
END $$;

-- Convert Subscription.status from ENUM to TEXT
DO $$ 
BEGIN
    -- Check if status is an ENUM type
    IF EXISTS (
        SELECT 1 
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'SubscriptionStatus'
    ) THEN
        -- Convert the column to TEXT
        ALTER TABLE "Subscription"
        ALTER COLUMN status TYPE TEXT
        USING status::TEXT;
        
        -- Drop the ENUM type
        DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
        
        RAISE NOTICE 'Converted Subscription.status from ENUM to TEXT';
    ELSE
        RAISE NOTICE 'Subscription.status is already TEXT';
    END IF;
END $$;

-- Ensure default values are set
ALTER TABLE "User" 
ALTER COLUMN role SET DEFAULT 'USER';

ALTER TABLE "Subscription"
ALTER COLUMN status SET DEFAULT 'PENDING';