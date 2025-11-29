/**
 * Schema Sync Tests
 *
 * Lightweight tests to ensure local TypeScript interfaces match Prisma schema.
 * These tests catch type mismatches BEFORE they reach production builds.
 *
 * Run: pnpm test -- schema-sync
 */

import { Provider, Program } from '~/repositories/provider.repository';

// Expected fields from Prisma schema - update if schema changes
const PROVIDER_SCHEMA = {
  required: [
    'id', 'businessName', 'contactName', 'email', 'phone',
    'address', 'suburb', 'state', 'postcode', 'description',
    'ageGroups', 'specialNeeds', 'isVetted', 'isPublished',
    'vettingStatus', 'createdAt', 'updatedAt'
  ],
  optional: [
    'website', 'abn', 'logoUrl', 'bannerUrl', 'capacity',
    'specialNeedsDetails', 'vettingNotes', 'vettingDate',
    'latitude', 'longitude'
  ]
} as const;

const PROGRAM_SCHEMA = {
  required: [
    'id', 'providerId', 'name', 'description', 'category',
    'ageMin', 'ageMax', 'price', 'location', 'startDate', 'endDate',
    'startTime', 'endTime', 'daysOfWeek', 'isActive', 'isPublished',
    'programStatus', 'createdAt', 'updatedAt'
  ],
  optional: [
    'capacity', 'enrollmentUrl', 'imageUrl'
  ]
} as const;

describe('Schema Sync: Provider', () => {
  // Create a type-safe mock that validates all required fields exist
  const mockProvider: Provider = {
    id: 'test-id',
    businessName: 'Test Business',
    contactName: 'John Doe',
    email: 'test@example.com',
    phone: '0400000000',
    website: null,
    abn: null,
    address: '123 Test St',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    description: 'Test description',
    logoUrl: null,
    bannerUrl: null,
    capacity: null,
    ageGroups: '[]',
    specialNeeds: false,
    specialNeedsDetails: null,
    isVetted: false,
    isPublished: false,
    vettingStatus: 'NOT_STARTED',
    vettingNotes: null,
    vettingDate: null,
    latitude: null,
    longitude: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should have all required fields', () => {
    for (const field of PROVIDER_SCHEMA.required) {
      expect(mockProvider).toHaveProperty(field);
      // Required fields should not be null/undefined
      expect(mockProvider[field as keyof Provider]).not.toBeUndefined();
    }
  });

  it('should have all optional fields defined (can be null)', () => {
    for (const field of PROVIDER_SCHEMA.optional) {
      expect(mockProvider).toHaveProperty(field);
    }
  });

  it('should have correct field count matching schema', () => {
    const expectedFieldCount = PROVIDER_SCHEMA.required.length + PROVIDER_SCHEMA.optional.length;
    const actualFieldCount = Object.keys(mockProvider).length;
    expect(actualFieldCount).toBe(expectedFieldCount);
  });
});

describe('Schema Sync: Program', () => {
  const mockProgram: Program = {
    id: 'test-id',
    providerId: 'provider-id',
    name: 'Test Program',
    description: 'Test description',
    category: 'Sports',
    ageMin: 5,
    ageMax: 12,
    price: 100,
    location: 'Test Location',
    startDate: new Date(),
    endDate: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: '[]',
    capacity: null,
    enrollmentUrl: null,
    imageUrl: null,
    isActive: true,
    isPublished: false,
    programStatus: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should have all required fields', () => {
    for (const field of PROGRAM_SCHEMA.required) {
      expect(mockProgram).toHaveProperty(field);
      expect(mockProgram[field as keyof Program]).not.toBeUndefined();
    }
  });

  it('should have all optional fields defined (can be null)', () => {
    for (const field of PROGRAM_SCHEMA.optional) {
      expect(mockProgram).toHaveProperty(field);
    }
  });

  it('should have correct field count matching schema', () => {
    const expectedFieldCount = PROGRAM_SCHEMA.required.length + PROGRAM_SCHEMA.optional.length;
    const actualFieldCount = Object.keys(mockProgram).length;
    expect(actualFieldCount).toBe(expectedFieldCount);
  });
});

describe('Schema Sync: Type Safety', () => {
  it('should catch if Provider type is used with wrong field types at compile time', () => {
    // This test exists to ensure TypeScript catches type errors
    // If this file compiles, the types are correctly defined
    const provider: Provider = {
      id: 'string-not-number',
      businessName: 'required-string',
      contactName: 'required-string',
      email: 'required-string',
      phone: 'required-string',
      website: null, // optional
      abn: null,
      address: 'required-string',
      suburb: 'required-string',
      state: 'required-string',
      postcode: 'required-string',
      description: 'required-string',
      logoUrl: null,
      bannerUrl: null,
      capacity: null,
      ageGroups: 'string-not-array',
      specialNeeds: false,
      specialNeedsDetails: null,
      isVetted: false,
      isPublished: false,
      vettingStatus: 'required-string',
      vettingNotes: null,
      vettingDate: null,
      latitude: null,
      longitude: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(provider).toBeDefined();
  });

  it('should catch if Program type is used with wrong field types at compile time', () => {
    const program: Program = {
      id: 'string',
      providerId: 'string',
      name: 'string',
      description: 'string',
      category: 'string',
      ageMin: 5, // number not string
      ageMax: 12,
      price: 100.0, // number not string
      location: 'string',
      startDate: new Date(),
      endDate: new Date(),
      startTime: 'string',
      endTime: 'string',
      daysOfWeek: 'string',
      capacity: null,
      enrollmentUrl: null,
      imageUrl: null,
      isActive: true,
      isPublished: false,
      programStatus: 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(program).toBeDefined();
  });
});
