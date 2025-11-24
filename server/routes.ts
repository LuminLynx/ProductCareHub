import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertBrandSchema, insertProductSchema, insertReviewSchema, insertSupportRequestSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and PDF files are allowed."));
    }
  },
});

// Helper function to generate warranty claim email content
function generateWarrantyEmail(product: any, brand: any, issue: any) {
  const purchaseDate = new Date(product.purchaseDate).toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    to: brand.supportEmail,
    subject: `Pedido de Assistência - ${product.name} (${product.model})`,
    body: `
Exmo(a) Senhor(a),

Venho por este meio solicitar assistência técnica para o seguinte produto:

INFORMAÇÃO DO PRODUTO:
- Produto: ${product.name}
- Marca: ${brand.name}
- Modelo: ${product.model}
${product.serialNumber ? `- Número de Série: ${product.serialNumber}` : ''}
- Data de Compra: ${purchaseDate}

DESCRIÇÃO DO PROBLEMA:
Categoria: ${issue.category}
Severidade: ${issue.severity}

${issue.issueDescription}

${product.receiptUrl ? '\nAnexo: Talão de compra em anexo' : ''}

Agradeço a vossa atenção e aguardo retorno.

Com os melhores cumprimentos,
[Cliente Warranty Manager]
    `.trim(),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const fs = await import("fs/promises");
  try {
    await fs.mkdir("uploads", { recursive: true });
  } catch (error) {
    // Directory already exists
  }

  // Serve uploaded files
  app.use("/uploads", (await import("express")).static("uploads"));

  // BRANDS ROUTES
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  app.get("/api/brands/:id", async (req, res) => {
    try {
      const brand = await storage.getBrand(req.params.id);
      if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brand" });
    }
  });

  app.post("/api/brands", async (req, res) => {
    try {
      const result = insertBrandSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const brand = await storage.createBrand(result.data);
      res.status(201).json(brand);
    } catch (error) {
      res.status(500).json({ error: "Failed to create brand" });
    }
  });

  // PRODUCTS ROUTES
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductWithDetails(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post(
    "/api/products",
    upload.fields([
      { name: "receipt", maxCount: 1 },
      { name: "photo_0", maxCount: 1 },
      { name: "photo_1", maxCount: 1 },
      { name: "photo_2", maxCount: 1 },
      { name: "photo_3", maxCount: 1 },
      { name: "photo_4", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};
        
        console.log("=== POST /api/products DEBUG ===");
        console.log("Request body:", req.body);
        console.log("Request files:", files);
        
        // Handle receipt upload
        let receiptUrl = null;
        if (files && files.receipt && files.receipt[0]) {
          receiptUrl = `/uploads/${files.receipt[0].filename}`;
        }

        // Handle photo uploads
        const photoUrls: string[] = [];
        if (files) {
          for (let i = 0; i < 5; i++) {
            const fieldName = `photo_${i}`;
            if (files[fieldName] && files[fieldName][0]) {
              photoUrls.push(`/uploads/${files[fieldName][0].filename}`);
            }
          }
        }
        
        // Parse product data from form with file URLs
        const productData = {
          brandId: req.body.brandId,
          name: req.body.name,
          model: req.body.model,
          serialNumber: req.body.serialNumber || null,
          category: req.body.category,
          purchaseDate: new Date(req.body.purchaseDate),
          notes: req.body.notes || null,
          receiptUrl,
          photoUrls,
        };

        console.log("Product data before validation:", productData);

        // Validate product data
        const result = insertProductSchema.safeParse(productData);
        if (!result.success) {
          console.error("Validation error:", fromZodError(result.error).message);
          console.error("Validation details:", result.error.errors);
          return res.status(400).json({ error: fromZodError(result.error).message });
        }

        console.log("Validation successful, creating product...");

        // Create product
        const product = await storage.createProduct(result.data);

        console.log("Product created successfully:", product.id);
        console.log("================================");

        res.status(201).json(product);
      } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  );

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // REVIEWS ROUTES
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const result = insertReviewSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const review = await storage.createReview(result.data);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // SUPPORT REQUESTS ROUTES
  app.get("/api/products/:productId/support-requests", async (req, res) => {
    try {
      const requests = await storage.getSupportRequestsByProduct(req.params.productId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch support requests" });
    }
  });

  app.post("/api/support-requests", async (req, res) => {
    try {
      const result = insertSupportRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      // Get product and brand details for email generation
      const product = await storage.getProductWithBrand(result.data.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Generate email content
      const emailContent = generateWarrantyEmail(product, product.brand, result.data);
      
      // In a real implementation, you would send the email here
      // For now, we'll just log it
      console.log("=== WARRANTY CLAIM EMAIL ===");
      console.log(`To: ${emailContent.to}`);
      console.log(`Subject: ${emailContent.subject}`);
      console.log(`Body:\n${emailContent.body}`);
      console.log("===========================");

      // Create support request record
      const supportRequest = await storage.createSupportRequest(result.data);
      
      res.status(201).json({
        supportRequest,
        emailSent: true,
        emailDetails: {
          to: emailContent.to,
          subject: emailContent.subject,
        },
      });
    } catch (error) {
      console.error("Error creating support request:", error);
      res.status(500).json({ error: "Failed to create support request" });
    }
  });

  app.patch("/api/support-requests/:id", async (req, res) => {
    try {
      const request = await storage.updateSupportRequest(req.params.id, req.body);
      if (!request) {
        return res.status(404).json({ error: "Support request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to update support request" });
    }
  });

  // PUBLIC COMMUNITY ROUTES
  app.get("/api/community/reviews", async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      const productsWithBrands = await Promise.all(
        reviews.map(async (review) => {
          const product = await storage.getProductWithBrand(review.productId);
          return product ? { ...review, product } : null;
        })
      );
      res.json(productsWithBrands.filter(r => r !== null));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch community reviews" });
    }
  });

  // SUPPORT HISTORY ROUTES (all support requests with product info)
  app.get("/api/support-history", async (req, res) => {
    try {
      const requests = await storage.getAllSupportRequests();
      const requestsWithDetails = await Promise.all(
        requests.map(async (request) => {
          const product = await storage.getProductWithBrand(request.productId);
          return product ? { ...request, product } : null;
        })
      );
      res.json(requestsWithDetails.filter(r => r !== null));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch support history" });
    }
  });

  // SEARCH ROUTES
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json({ products: [], brands: [] });
      }

      const [products, brands] = await Promise.all([
        storage.searchProducts(query),
        storage.searchBrands(query),
      ]);

      res.json({ products, brands });
    } catch (error) {
      res.status(500).json({ error: "Failed to search" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
