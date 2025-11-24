import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Mail, Phone, Globe, Package } from "lucide-react";
import type { Brand } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Brands() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const filteredBrands = brands?.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductCountForBrand = (brandId: string) => {
    return products?.filter((p: any) => p.brandId === brandId).length || 0;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Base de Dados de Marcas</h1>
          <p className="text-muted-foreground mt-1">Informações de contacto dos fabricantes</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar marcas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-brands"
          />
        </div>

        {/* Brands Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredBrands && filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <Card key={brand.id} className="p-6 space-y-4 hover-elevate transition-all" data-testid={`card-brand-${brand.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} className="h-12 object-contain mb-2" />
                    ) : (
                      <div className="h-12 flex items-center mb-2">
                        <h3 className="text-xl font-bold" data-testid={`text-brand-name-${brand.id}`}>{brand.name}</h3>
                      </div>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {brand.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{getProductCountForBrand(brand.id)}</div>
                    <div className="text-xs text-muted-foreground">produtos</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{brand.supportEmail}</span>
                  </div>
                  {brand.supportPhone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{brand.supportPhone}</span>
                    </div>
                  )}
                  {brand.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        {brand.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" size="sm" data-testid={`button-view-contact-${brand.id}`}>
                      Ver Contactos
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{brand.name} - Informações de Contacto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                        <p className="mt-1">{brand.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email de Suporte</label>
                        <p className="mt-1">
                          <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">
                            {brand.supportEmail}
                          </a>
                        </p>
                      </div>
                      {brand.supportPhone && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                          <p className="mt-1">
                            <a href={`tel:${brand.supportPhone}`} className="text-primary hover:underline">
                              {brand.supportPhone}
                            </a>
                          </p>
                        </div>
                      )}
                      {brand.website && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Website</label>
                          <p className="mt-1">
                            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {brand.website}
                            </a>
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Produtos Registados</label>
                        <p className="mt-1">{getProductCountForBrand(brand.id)} produtos</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma marca encontrada</h3>
            <p className="text-muted-foreground">Tente ajustar a pesquisa</p>
          </div>
        )}
      </div>
    </div>
  );
}
