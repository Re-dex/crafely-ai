export interface CreatePackageDto {
  name: string;
  description?: string;
  price: number;
  features: string[];
  interval?: string;
  active?: boolean;
}

export interface UpdatePackageDto {
  name?: string;
  description?: string;
  price?: number;
  features?: string[];
  interval?: string;
  active?: boolean;
}

export interface CreateSubscriptionDto {
  userId: string;
  packageId: string;
  status?: string;
  endDate?: Date;
}
