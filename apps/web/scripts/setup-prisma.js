#!/usr/bin/env node

/**
 * Prisma Schema Setup Script
 * 
 * This script automatically configures Prisma to use:
 * - SQLite for local development
 * - PostgreSQL for production (Vercel)
 * 
 * It runs before build and generate commands.
 */

const fs = require('fs');
const path = require('path');

const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
const isVercelBuild = process.env.VERCEL === '1';

console.log('🔧 Configuring Prisma schema...');
console.log(`   Environment: ${isProduction ? 'Production (PostgreSQL)' : 'Development (SQLite)'}`);
console.log(`   VERCEL env: ${process.env.VERCEL}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const sqliteSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.sqlite.prisma');
const postgresSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.production.prisma');

// Create SQLite schema if it doesn't exist
if (!fs.existsSync(sqliteSchemaPath)) {
  const currentSchema = fs.readFileSync(schemaPath, 'utf8');
  const sqliteSchema = currentSchema.replace(
    /provider\s*=\s*"postgresql"/g,
    'provider = "sqlite"'
  );
  fs.writeFileSync(sqliteSchemaPath, sqliteSchema);
  console.log('   Created schema.sqlite.prisma');
}

// Use appropriate schema based on environment
if (isProduction || isVercelBuild) {
  // Use PostgreSQL schema for production
  if (fs.existsSync(postgresSchemaPath)) {
    const postgresSchema = fs.readFileSync(postgresSchemaPath, 'utf8');
    fs.writeFileSync(schemaPath, postgresSchema);
    console.log('✅ Using PostgreSQL schema for production');
  } else {
    // Fallback: modify existing schema to use PostgreSQL
    const currentSchema = fs.readFileSync(schemaPath, 'utf8');
    const updatedSchema = currentSchema.replace(
      /provider\s*=\s*"sqlite"/g,
      'provider = "postgresql"'
    );
    fs.writeFileSync(schemaPath, updatedSchema);
    console.log('✅ Updated schema to use PostgreSQL');
  }
} else {
  // Use SQLite schema for local development
  if (fs.existsSync(sqliteSchemaPath)) {
    const sqliteSchema = fs.readFileSync(sqliteSchemaPath, 'utf8');
    fs.writeFileSync(schemaPath, sqliteSchema);
    console.log('✅ Using SQLite schema for local development');
  } else {
    // Ensure SQLite is set
    const currentSchema = fs.readFileSync(schemaPath, 'utf8');
    const updatedSchema = currentSchema.replace(
      /provider\s*=\s*"postgresql"/g,
      'provider = "sqlite"'
    );
    fs.writeFileSync(schemaPath, updatedSchema);
    console.log('✅ Updated schema to use SQLite');
  }
}

// Also ensure DATABASE_URL is set appropriately
if (!process.env.DATABASE_URL) {
  if (isProduction) {
    console.warn('⚠️  DATABASE_URL not set in production!');
  } else {
    process.env.DATABASE_URL = 'file:./db.sqlite';
    console.log('   Set DATABASE_URL to: file:./db.sqlite');
  }
} else {
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL.substring(0, 20)}...`);
}