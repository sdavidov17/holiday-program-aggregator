import { createInnerTRPCContext } from "~/server/api/trpc";
import { providerRouter } from "../provider";
import { type Session } from "next-auth";
import { TRPCError } from "@trpc/server";

jest.mock("~/server/db", () => ({
  db: {
    provider: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    program: {
      create: jest.fn(),
    },
  },
}));

const mockDb = require("~/server/db").db;

describe("providerRouter", () => {
  let ctx: ReturnType<typeof createInnerTRPCContext>;
  let adminCtx: ReturnType<typeof createInnerTRPCContext>;
  let router: ReturnType<typeof providerRouter.createCaller>;
  let adminRouter: ReturnType<typeof providerRouter.createCaller>;

  const mockUserSession: Session = {
    user: { id: "user-1", email: "user@test.com", role: "USER" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  const mockAdminSession: Session = {
    user: { id: "admin-1", email: "admin@test.com", role: "ADMIN" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    ctx = createInnerTRPCContext({
      session: mockUserSession,
      correlationId: 'test-correlation-id',
    });
    
    adminCtx = createInnerTRPCContext({
      session: mockAdminSession,
      correlationId: 'test-correlation-id',
    });

    router = providerRouter.createCaller(ctx);
    adminRouter = providerRouter.createCaller(adminCtx);
  });

  describe("getAll", () => {
    it("should require admin role", async () => {
      await expect(router.getAll()).rejects.toThrow(TRPCError);
    });

    it("should return all providers for admin", async () => {
      const mockProviders = [
        { id: "1", name: "Provider 1", isPublished: true, isVetted: true, programs: [] },
        { id: "2", name: "Provider 2", isPublished: false, isVetted: false, programs: [] },
      ];
      
      mockDb.provider.findMany.mockResolvedValue(mockProviders);
      
      // By default, includeUnpublished and includeUnvetted are undefined, which filters them
      const result = await adminRouter.getAll();
      
      expect(result).toEqual(mockProviders);
      expect(mockDb.provider.findMany).toHaveBeenCalledWith({
        where: { isPublished: true, isVetted: true },
        include: { programs: true },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should filter providers based on parameters", async () => {
      await adminRouter.getAll({ includeUnpublished: false, includeUnvetted: false });
      
      expect(mockDb.provider.findMany).toHaveBeenCalledWith({
        where: { isPublished: true, isVetted: true },
        include: { programs: true },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getPublished", () => {
    it("should return only published and vetted providers", async () => {
      const mockProviders = [
        { id: "1", name: "Provider 1", isPublished: true, isVetted: true, programs: [] },
      ];
      
      mockDb.provider.findMany.mockResolvedValue(mockProviders);
      
      const result = await router.getPublished();
      
      expect(result).toEqual(mockProviders);
      expect(mockDb.provider.findMany).toHaveBeenCalledWith({
        where: { isPublished: true, isVetted: true },
        include: {
          programs: {
            where: { isPublished: true, isActive: true },
          },
        },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("getById", () => {
    it("should return provider by id", async () => {
      const mockProvider = {
        id: "1",
        name: "Provider 1",
        isPublished: true,
        isVetted: true,
        programs: [],
      };
      
      mockDb.provider.findUnique.mockResolvedValue(mockProvider);
      
      const result = await router.getById({ id: "1" });
      
      expect(result).toEqual(mockProvider);
    });

    it("should throw error if provider not found", async () => {
      mockDb.provider.findUnique.mockResolvedValue(null);
      
      await expect(router.getById({ id: "nonexistent" })).rejects.toThrow(TRPCError);
    });

    it("should prevent non-admin from viewing unpublished providers", async () => {
      const mockProvider = {
        id: "1",
        name: "Provider 1",
        isPublished: false,
        isVetted: false,
        programs: [],
      };
      
      mockDb.provider.findUnique.mockResolvedValue(mockProvider);
      
      await expect(router.getById({ id: "1" })).rejects.toThrow(TRPCError);
    });
  });

  describe("create", () => {
    it("should require admin role", async () => {
      await expect(router.create({ name: "New Provider" })).rejects.toThrow(TRPCError);
    });

    it("should create a new provider", async () => {
      const newProvider = {
        id: "new-1",
        name: "New Provider",
        description: "Test description",
        isVetted: true,
        isPublished: false,
      };
      
      mockDb.provider.create.mockResolvedValue(newProvider);
      
      const result = await adminRouter.create({
        name: "New Provider",
        description: "Test description",
        isVetted: true,
        isPublished: false,
      });
      
      expect(result).toEqual(newProvider);
      expect(mockDb.provider.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "New Provider",
          description: "Test description",
          vettedBy: "admin-1",
          vettedAt: expect.any(Date),
        }),
      });
    });
  });

  describe("update", () => {
    it("should require admin role", async () => {
      await expect(router.update({ id: "1", name: "Updated" })).rejects.toThrow(TRPCError);
    });

    it("should update provider", async () => {
      const existingProvider = { id: "1", isVetted: false, isPublished: false };
      const updatedProvider = { id: "1", name: "Updated", isVetted: true, isPublished: false };
      
      mockDb.provider.findUnique.mockResolvedValue(existingProvider);
      mockDb.provider.update.mockResolvedValue(updatedProvider);
      
      const result = await adminRouter.update({
        id: "1",
        name: "Updated",
        isVetted: true,
      });
      
      expect(result).toEqual(updatedProvider);
      expect(mockDb.provider.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: expect.objectContaining({
          name: "Updated",
          isVetted: true,
          vettedBy: "admin-1",
          vettedAt: expect.any(Date),
        }),
      });
    });
  });

  describe("delete", () => {
    it("should require admin role", async () => {
      await expect(router.delete({ id: "1" })).rejects.toThrow(TRPCError);
    });

    it("should delete provider", async () => {
      mockDb.provider.findUnique.mockResolvedValue({ name: "Provider 1" });
      mockDb.provider.delete.mockResolvedValue({ id: "1" });
      
      const result = await adminRouter.delete({ id: "1" });
      
      expect(result).toEqual({ success: true });
      expect(mockDb.provider.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should throw error if provider not found", async () => {
      mockDb.provider.findUnique.mockResolvedValue(null);
      
      await expect(adminRouter.delete({ id: "nonexistent" })).rejects.toThrow(TRPCError);
    });
  });

  describe("toggleVetting", () => {
    it("should toggle vetting status", async () => {
      const mockProvider = { id: "1", isVetted: false };
      const updatedProvider = { id: "1", isVetted: true };
      
      mockDb.provider.findUnique.mockResolvedValue(mockProvider);
      mockDb.provider.update.mockResolvedValue(updatedProvider);
      
      const result = await adminRouter.toggleVetting({ id: "1" });
      
      expect(result).toEqual(updatedProvider);
      expect(mockDb.provider.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          isVetted: true,
          vettedBy: "admin-1",
          vettedAt: expect.any(Date),
        },
      });
    });
  });

  describe("togglePublishing", () => {
    it("should toggle publishing status", async () => {
      const mockProvider = { id: "1", isPublished: false, isVetted: true };
      const updatedProvider = { id: "1", isPublished: true, isVetted: true };
      
      mockDb.provider.findUnique.mockResolvedValue(mockProvider);
      mockDb.provider.update.mockResolvedValue(updatedProvider);
      
      const result = await adminRouter.togglePublishing({ id: "1" });
      
      expect(result).toEqual(updatedProvider);
      expect(mockDb.provider.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          isPublished: true,
          publishedAt: expect.any(Date),
        },
      });
    });

    it("should prevent publishing unvetted providers", async () => {
      const mockProvider = { id: "1", isPublished: false, isVetted: false };
      
      mockDb.provider.findUnique.mockResolvedValue(mockProvider);
      
      await expect(adminRouter.togglePublishing({ id: "1" })).rejects.toThrow(TRPCError);
    });
  });

  describe("createProgram", () => {
    it("should require admin role", async () => {
      await expect(router.createProgram({ 
        providerId: "1", 
        name: "New Program" 
      })).rejects.toThrow(TRPCError);
    });

    it("should create a new program", async () => {
      const newProgram = {
        id: "prog-1",
        providerId: "1",
        name: "Summer Camp",
        category: "Sports",
      };
      
      mockDb.program.create.mockResolvedValue(newProgram);
      
      const result = await adminRouter.createProgram({
        providerId: "1",
        name: "Summer Camp",
        category: "Sports",
      });
      
      expect(result).toEqual(newProgram);
      expect(mockDb.program.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          providerId: "1",
          name: "Summer Camp",
          category: "Sports",
        }),
      });
    });
  });
});