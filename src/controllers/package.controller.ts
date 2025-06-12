import { Request, Response } from "express";
import { BaseController } from "../app/BaseController";
import { PackageService } from "../services/package.service";

export class PackageController extends BaseController {
  private packageService: PackageService;

  constructor() {
    super();
    this.packageService = new PackageService();
  }

  async createPackage(req: Request, res: Response) {
    try {
      const _package = await this.packageService.createPackage(req.body);
      return this.success(res, _package);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async getPackages(req: Request, res: Response) {
    try {
      const packages = await this.packageService.getPackages();
      return this.success(res, packages);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async getPackage(req: Request, res: Response) {
    try {
      const _package = await this.packageService.getPackageById(req.params.id);
      if (!_package) {
        return this.notFound(res);
      }
      return this.success(res, _package);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async updatePackage(req: Request, res: Response) {
    try {
      const _package = await this.packageService.updatePackage(
        req.params.id,
        req.body
      );
      return this.success(res, _package);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async deletePackage(req: Request, res: Response) {
    try {
      const _package = await this.packageService.deletePackage(req.params.id);
      return this.success(res, _package);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async createSubscription(req: any, res: Response) {
    try {
      const subscription = await this.packageService.createSubscription({
        ...req.body,
        userId: req.user.id,
      });
      return this.success(res, subscription);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async getUserSubscription(req: any, res: Response) {
    try {
      const subscription = await this.packageService.getUserSubscription(
        req.user.id
      );
      return this.success(res, subscription);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async cancelSubscription(req: Request, res: Response) {
    try {
      const subscription = await this.packageService.cancelSubscription(
        req.params.id
      );
      return this.success(res, subscription);
    } catch (error) {
      return this.error(res, error);
    }
  }
}
