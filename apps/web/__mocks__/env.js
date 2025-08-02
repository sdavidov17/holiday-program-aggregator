// Mock for ~/env.mjs in tests
module.exports = {
  env: {
    NODE_ENV: 'test',
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXTAUTH_SECRET: 'test-secret',
    DATABASE_URL: 'file:./test.db',
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
    APPLE_ID: 'test-apple-id',
    APPLE_SECRET: 'test-apple-secret',
    DISCORD_CLIENT_ID: 'test-discord-client-id',
    DISCORD_CLIENT_SECRET: 'test-discord-client-secret',
    ENCRYPTION_KEY: 'test-32-character-encryption-key',
  }
};