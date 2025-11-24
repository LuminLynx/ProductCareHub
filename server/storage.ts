import {
  type Brand,
  type InsertBrand,
  type Product,
  type InsertProduct,
  type Review,
  type InsertReview,
  type SupportRequest,
  type InsertSupportRequest,
  type ProductWithBrand,
  type ProductWithDetails,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Brands
  getBrand(id: string): Promise<Brand | undefined>;
  getAllBrands(): Promise<Brand[]>;
  createBrand(brand: InsertBrand): Promise<Brand>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getProductWithBrand(id: string): Promise<ProductWithBrand | undefined>;
  getProductWithDetails(id: string): Promise<ProductWithDetails | undefined>;
  getAllProducts(): Promise<ProductWithBrand[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Reviews
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByProduct(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Support Requests
  getSupportRequest(id: string): Promise<SupportRequest | undefined>;
  getSupportRequestsByProduct(productId: string): Promise<SupportRequest[]>;
  createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest>;
  updateSupportRequest(id: string, request: Partial<SupportRequest>): Promise<SupportRequest | undefined>;
}

export class MemStorage implements IStorage {
  private brands: Map<string, Brand>;
  private products: Map<string, Product>;
  private reviews: Map<string, Review>;
  private supportRequests: Map<string, SupportRequest>;

  constructor() {
    this.brands = new Map();
    this.products = new Map();
    this.reviews = new Map();
    this.supportRequests = new Map();

    // Seed with some popular brands
    this.seedBrands();
  }

  private seedBrands() {
    const brands: InsertBrand[] = [
      {
        name: "Apple",
        supportEmail: "support@apple.com",
        supportPhone: "+1-800-692-7753",
        website: "https://www.apple.com/support/",
        category: "Informática",
      },
      {
        name: "Samsung",
        supportEmail: "support@samsung.com",
        supportPhone: "+351-808-207-267",
        website: "https://www.samsung.com/pt/support/",
        category: "Eletrodomésticos",
      },
      {
        name: "LG",
        supportEmail: "apoio.cliente@lge.com",
        supportPhone: "+351-707-505-454",
        website: "https://www.lg.com/pt/support",
        category: "Eletrodomésticos",
      },
      {
        name: "Sony",
        supportEmail: "info@sony.pt",
        supportPhone: "+351-707-780-785",
        website: "https://www.sony.pt/support",
        category: "Televisão e Áudio",
      },
      {
        name: "Bosch",
        supportEmail: "bosch-pt@bshg.com",
        supportPhone: "+351-214-250-730",
        website: "https://www.bosch-home.pt/servico",
        category: "Eletrodomésticos",
      },
      {
        name: "Siemens",
        supportEmail: "siemens-pt@bshg.com",
        supportPhone: "+351-214-250-700",
        website: "https://www.siemens-home.bsh-group.com/pt/",
        category: "Eletrodomésticos",
      },
      {
        name: "Microsoft",
        supportEmail: "support@microsoft.com",
        supportPhone: "+351-21-366-5100",
        website: "https://support.microsoft.com/",
        category: "Informática",
      },
      {
        name: "Dell",
        supportEmail: "tech_support@dell.com",
        supportPhone: "+351-707-788-788",
        website: "https://www.dell.com/support/",
        category: "Informática",
      },
      {
        name: "HP",
        supportEmail: "support@hp.com",
        supportPhone: "+351-707-222-000",
        website: "https://support.hp.com/",
        category: "Informática",
      },
      {
        name: "Xiaomi",
        supportEmail: "service.pt@xiaomi.com",
        supportPhone: "+351-308-810-456",
        website: "https://www.mi.com/pt/service/",
        category: "Telefones",
      },
    ];

    brands.forEach((brand) => {
      const id = randomUUID();
      this.brands.set(id, { ...brand, id });
    });
  }

  // Brands
  async getBrand(id: string): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async getAllBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const id = randomUUID();
    const brand: Brand = { ...insertBrand, id };
    this.brands.set(id, brand);
    return brand;
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductWithBrand(id: string): Promise<ProductWithBrand | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const brand = await this.getBrand(product.brandId);
    if (!brand) return undefined;

    return { ...product, brand };
  }

  async getProductWithDetails(id: string): Promise<ProductWithDetails | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const brand = await this.getBrand(product.brandId);
    if (!brand) return undefined;

    const reviews = await this.getReviewsByProduct(id);
    const supportRequests = await this.getSupportRequestsByProduct(id);

    return { ...product, brand, reviews, supportRequests };
  }

  async getAllProducts(): Promise<ProductWithBrand[]> {
    const products = Array.from(this.products.values());
    const productsWithBrands = await Promise.all(
      products.map(async (product) => {
        const brand = await this.getBrand(product.brandId);
        if (!brand) return null;
        return { ...product, brand };
      })
    );

    return productsWithBrands.filter((p): p is ProductWithBrand => p !== null)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    
    // Calculate warranty expiration (3 years from purchase date in Europe)
    const purchaseDate = new Date(insertProduct.purchaseDate);
    const warrantyExpiration = new Date(purchaseDate);
    warrantyExpiration.setFullYear(warrantyExpiration.getFullYear() + 3);

    const product: Product = {
      ...insertProduct,
      id,
      purchaseDate,
      warrantyExpiration,
      photoUrls: insertProduct.photoUrls || [],
    };
    
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    // Delete associated reviews and support requests
    const reviews = await this.getReviewsByProduct(id);
    reviews.forEach(review => this.reviews.delete(review.id));

    const supportRequests = await this.getSupportRequestsByProduct(id);
    supportRequests.forEach(request => this.supportRequests.delete(request.id));

    return this.products.delete(id);
  }

  // Reviews
  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
      pros: insertReview.pros || [],
      cons: insertReview.cons || [],
    };
    this.reviews.set(id, review);
    return review;
  }

  // Support Requests
  async getSupportRequest(id: string): Promise<SupportRequest | undefined> {
    return this.supportRequests.get(id);
  }

  async getSupportRequestsByProduct(productId: string): Promise<SupportRequest[]> {
    return Array.from(this.supportRequests.values())
      .filter(request => request.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createSupportRequest(insertRequest: InsertSupportRequest): Promise<SupportRequest> {
    const id = randomUUID();
    const supportRequest: SupportRequest = {
      ...insertRequest,
      id,
      status: "sent",
      emailSentAt: new Date(),
      createdAt: new Date(),
    };
    this.supportRequests.set(id, supportRequest);
    return supportRequest;
  }

  async updateSupportRequest(id: string, updates: Partial<SupportRequest>): Promise<SupportRequest | undefined> {
    const request = this.supportRequests.get(id);
    if (!request) return undefined;

    const updated = { ...request, ...updates };
    this.supportRequests.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
