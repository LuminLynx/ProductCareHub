import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WarrantyStatusBadge } from "./warranty-status-badge";
import { StarRating } from "./star-rating";
import { Eye, AlertTriangle, Package } from "lucide-react";
import type { ProductWithBrand } from "@shared/schema";
import { Link } from "wouter";

interface ProductCardProps {
  product: ProductWithBrand;
  averageRating?: number;
}

export function ProductCard({ product, averageRating = 0 }: ProductCardProps) {
  const warrantyExpiration = new Date(product.warrantyExpiration);
  const today = new Date();
  const daysRemaining = Math.ceil((warrantyExpiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const warrantyStatus = daysRemaining < 0 ? "expired" : daysRemaining <= 90 ? "expiring" : "valid";

  const purchaseDate = new Date(product.purchaseDate).toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const primaryImage = product.photoUrls?.[0];

  return (
    <Card className="overflow-hidden hover-elevate transition-all group" data-testid={`card-product-${product.id}`}>
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs font-semibold bg-background/90 backdrop-blur-sm">
            {product.brand.name}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <WarrantyStatusBadge status={warrantyStatus} daysRemaining={daysRemaining > 0 ? daysRemaining : undefined} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1" data-testid="text-product-name">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {product.model}
            {product.serialNumber && ` • S/N: ${product.serialNumber}`}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Comprado: {purchaseDate}
          </div>
          <StarRating rating={averageRating} size="sm" />
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/produto/${product.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-${product.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          </Link>
          <Link href={`/produto/${product.id}/suporte`} className="flex-1">
            <Button variant="default" size="sm" className="w-full" data-testid={`button-report-${product.id}`}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reportar
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
