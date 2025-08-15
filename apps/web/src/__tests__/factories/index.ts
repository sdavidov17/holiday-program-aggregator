/**
 * Test Data Factories
 * Centralized test data generation for consistent testing
 */

import { faker } from '@faker-js/faker';
import type { Program, Provider, Subscription, SubscriptionTier, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { MOCK_DATA, SECURITY } from '../constants';

// Set faker seed for reproducible tests
faker.seed(MOCK_DATA.FAKER_SEED);

/**
 * User Factory
 */
export const createTestUser = async (overrides?: Partial<User>): Promise<Partial<User>> => {
  const hashedPassword =
    overrides?.hashedPassword ||
    (await bcrypt.hash(SECURITY.DEFAULT_PASSWORD, SECURITY.BCRYPT_ROUNDS));

  return {
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    role: 'USER',
    emailVerified: new Date(),
    image: faker.image.avatar(),
    hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * Provider Factory
 */
export const createTestProvider = (overrides?: Partial<Provider>): Partial<Provider> => ({
  id: faker.string.uuid(),
  businessName: faker.company.name(),
  contactName: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  phone: faker.phone.number('04########'),
  website: faker.internet.url(),
  abn: faker.string.numeric(11),
  address: faker.location.streetAddress(),
  suburb: faker.location.city(),
  state: faker.helpers.arrayElement(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']),
  postcode: faker.location.zipCode('####'),
  description: faker.company.catchPhrase(),
  logoUrl: faker.image.url(),
  capacity: faker.number.int({ min: 10, max: 100 }),
  ageGroups: ['5-7', '8-12'],
  specialNeeds: faker.datatype.boolean(),
  specialNeedsDetails: faker.lorem.sentence(),
  isVetted: true,
  isPublished: true,
  vettingStatus: 'APPROVED',
  vettingDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Subscription Factory
 */
export const createTestSubscription = (
  overrides?: Partial<Subscription>,
): Partial<Subscription> => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  stripeCustomerId: `cus_${faker.string.alphanumeric(14)}`,
  stripeSubscriptionId: `sub_${faker.string.alphanumeric(14)}`,
  stripePriceId: faker.helpers.arrayElement(['price_basic', 'price_essential', 'price_premium']),
  tier: faker.helpers.arrayElement(['BASIC', 'ESSENTIAL', 'PREMIUM']) as SubscriptionTier,
  status: 'ACTIVE',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  cancelAtPeriodEnd: false,
  expiresAt: null, // Only set when subscription is cancelled
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Program Factory
 */
export const createTestProgram = (overrides?: Partial<Program>): Partial<Program> => ({
  id: faker.string.uuid(),
  providerId: faker.string.uuid(),
  name: faker.helpers.arrayElement(['Summer Camp', 'Art Workshop', 'Sports Club', 'Science Lab']),
  description: faker.lorem.paragraph(),
  category: faker.helpers.arrayElement(['Sports', 'Arts', 'STEM', 'Outdoor']),
  ageMin: faker.number.int({ min: 5, max: 8 }),
  ageMax: faker.number.int({ min: 10, max: 16 }),
  price: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
  location: faker.location.streetAddress(),
  startDate: faker.date.future(),
  endDate: faker.date.future(),
  startTime: '09:00',
  endTime: '17:00',
  daysOfWeek: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
  capacity: faker.number.int({ min: 10, max: 30 }),
  enrolledCount: 0,
  isActive: true,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Stripe Event Factory
 */
export const createStripeEvent = (type: string, data: any) => ({
  id: `evt_${faker.string.alphanumeric(24)}`,
  object: 'event',
  api_version: '2023-10-16',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: data,
  },
  livemode: false,
  pending_webhooks: 0,
  request: {
    id: `req_${faker.string.alphanumeric(14)}`,
    idempotency_key: faker.string.uuid(),
  },
  type,
});

/**
 * Stripe Customer Factory
 */
export const createStripeCustomer = (overrides?: any) => ({
  id: `cus_${faker.string.alphanumeric(14)}`,
  object: 'customer',
  email: faker.internet.email().toLowerCase(),
  name: faker.person.fullName(),
  created: Math.floor(Date.now() / 1000),
  livemode: false,
  metadata: {},
  ...overrides,
});

/**
 * Stripe Subscription Factory
 */
export const createStripeSubscription = (overrides?: any) => ({
  id: `sub_${faker.string.alphanumeric(14)}`,
  object: 'subscription',
  customer: `cus_${faker.string.alphanumeric(14)}`,
  status: 'active',
  current_period_start: Math.floor(Date.now() / 1000),
  current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
  items: {
    data: [
      {
        id: `si_${faker.string.alphanumeric(14)}`,
        price: {
          id: `price_${faker.string.alphanumeric(14)}`,
          product: `prod_${faker.string.alphanumeric(14)}`,
          unit_amount: 2900,
          currency: 'aud',
        },
      },
    ],
  },
  metadata: {
    tier: 'ESSENTIAL',
  },
  cancel_at_period_end: false,
  ...overrides,
});

/**
 * Stripe Payment Intent Factory
 */
export const createStripePaymentIntent = (overrides?: any) => ({
  id: `pi_${faker.string.alphanumeric(24)}`,
  object: 'payment_intent',
  amount: 2900,
  currency: 'aud',
  customer: `cus_${faker.string.alphanumeric(14)}`,
  status: 'succeeded',
  charges: {
    data: [
      {
        id: `ch_${faker.string.alphanumeric(24)}`,
        amount: 2900,
        currency: 'aud',
        paid: true,
        status: 'succeeded',
      },
    ],
  },
  metadata: {},
  ...overrides,
});

/**
 * Batch Factory Utilities
 */
export const createTestProviders = (
  count: number,
  overrides?: Partial<Provider>,
): Partial<Provider>[] => {
  return Array.from({ length: count }, () => createTestProvider(overrides));
};

export const createTestPrograms = (count: number, providerId: string): Partial<Program>[] => {
  return Array.from({ length: count }, () => createTestProgram({ providerId }));
};

/**
 * Test Scenario Factories
 */
export const createProviderWithPrograms = (programCount = 3) => {
  const provider = createTestProvider();
  const programs = createTestPrograms(programCount, provider.id!);
  return { provider, programs };
};

export const createUserWithSubscription = async (tier: SubscriptionTier = 'ESSENTIAL') => {
  const user = await createTestUser();
  const subscription = createTestSubscription({
    userId: user.id,
    tier,
  });
  return { user, subscription };
};

/**
 * Database Seeding Utilities
 */
export const seedTestDatabase = async (_prisma: any) => {
  // Create test users
  const users = await Promise.all([
    createTestUser({ email: 'parent1@test.com', role: 'USER' }),
    createTestUser({ email: 'parent2@test.com', role: 'USER' }),
    createTestUser({ email: 'admin@test.com', role: 'ADMIN' }),
  ]);

  // Create test providers with programs
  const providersData = Array.from({ length: 5 }, () => createProviderWithPrograms(3));

  // Create test subscriptions
  const subscriptions = [
    createTestSubscription({ userId: users[0].id, tier: 'BASIC' }),
    createTestSubscription({ userId: users[1].id, tier: 'PREMIUM' }),
  ];

  return {
    users,
    providers: providersData.map((p) => p.provider),
    programs: providersData.flatMap((p) => p.programs),
    subscriptions,
  };
};

/**
 * Test Cleanup Utilities
 */
export const cleanupTestData = async (prisma: any) => {
  // Delete in reverse order of dependencies
  await prisma.program.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: '@test.com',
      },
    },
  });
};
