import { Package, UserSubscription } from "../generated/prisma";
import { prisma } from "../database/prisma";
import {
  CreatePackageDto,
  UpdatePackageDto,
  CreateSubscriptionDto,
} from "../types/package.types";

export class PackageService {
  async createPackage(data: CreatePackageDto): Promise<Package> {
    return prisma.package.create({
      data,
    });
  }

  async getPackages(): Promise<Package[]> {
    return prisma.package.findMany({
      where: { active: true },
    });
  }

  async getPackageById(id: string): Promise<Package | null> {
    return prisma.package.findUnique({
      where: { id },
    });
  }

  async updatePackage(id: string, data: UpdatePackageDto): Promise<Package> {
    return prisma.package.update({
      where: { id },
      data,
    });
  }

  async deletePackage(id: string): Promise<Package> {
    return prisma.package.update({
      where: { id },
      data: { active: false },
    });
  }

  async createSubscription(
    data: CreateSubscriptionDto
  ): Promise<UserSubscription> {
    return prisma.userSubscription.create({
      data: {
        userId: data.userId,
        packageId: data.packageId,
        status: data.status || "active",
        endDate: data.endDate,
      },
    });
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    return prisma.userSubscription.findFirst({
      where: {
        userId,
        status: "active",
      },
      include: {
        package: true,
      },
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<UserSubscription> {
    return prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "cancelled",
        endDate: new Date(),
      },
    });
  }
}
