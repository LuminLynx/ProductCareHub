import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/stats-card";
import { ProductCard } from "@/components/product-card";
import { Package, CheckCircle, AlertCircle, XCircle, Plus, Search, Filter, Download } from "lucide-react";
import { Link } from "wouter";
import type { ProductWithBrand, Review } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");

  const { data: products, isLoading } = useQuery<ProductWithBrand[]>({
    queryKey: ["/api/products"],
  });

  const { data: brands } = useQuery({
    queryKey: ["/api/brands"],
  });

  const { data: allReviews } = useQuery<Review[]>({
    queryKey: ["/api/community/reviews"],
  });

  // Calculate statistics
  const totalProducts = products?.length || 0;
  const activeWarranties = products?.filter(p => {
    const daysRemaining = Math.ceil((new Date(p.warrantyExpiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining > 90;
  }).length || 0;
  const expiringWarranties = products?.filter(p => {
    const daysRemaining = Math.ceil((new Date(p.warrantyExpiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining >= 0 && daysRemaining <= 90;
  }).length || 0;
  const expiredWarranties = products?.filter(p => {
    const daysRemaining = Math.ceil((new Date(p.warrantyExpiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining < 0;
  }).length || 0;

  // Filter products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const daysRemaining = Math.ceil((new Date(product.warrantyExpiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const productStatus = daysRemaining < 0 ? "expired" : daysRemaining <= 90 ? "expiring" : "valid";
    const matchesStatus = filterStatus === "all" || productStatus === filterStatus;
    
    const matchesBrand = filterBrand === "all" || product.brandId === filterBrand;
    
    // Filter by rating
    let matchesRating = true;
    if (filterRating !== "all") {
      const productReviews = allReviews?.filter(r => r.productId === product.id) || [];
      if (productReviews.length > 0) {
        const avgRating = Math.round(productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length);
        matchesRating = avgRating === parseInt(filterRating);
      } else {
        matchesRating = filterRating === "0";
      }
    }
    
    return matchesSearch && matchesStatus && matchesBrand && matchesRating;
  });

  const handleExportPDF = () => {
    window.location.href = "/api/products/export/pdf";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Meus Produtos</h1>
            <p className="text-muted-foreground mt-1">Gerir garantias e produtos eletrónicos</p>
          </div>
          <Link href="/registar">
            <Button size="lg" data-testid="button-add-product">
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Produto
            </Button>
          </Link>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total de Produtos" value={totalProducts} icon={Package} variant="default" />
          <StatsCard title="Garantias Ativas" value={activeWarranties} icon={CheckCircle} variant="success" />
          <StatsCard title="Expiram em Breve" value={expiringWarranties} icon={AlertCircle} variant="warning" />
          <StatsCard title="Garantias Expiradas" value={expiredWarranties} icon={XCircle} variant="danger" />
        </div>

        {/* Filters and Export */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportPDF}
              data-testid="button-export-pdf"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar produtos, modelos ou marcas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-status">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado da garantia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="valid">Garantia Válida</SelectItem>
                <SelectItem value="expiring">Expira em Breve</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-brand">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Marcas</SelectItem>
                {brands?.map((brand: any) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-rating">
                <SelectValue placeholder="Classificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Classificações</SelectItem>
                <SelectItem value="0">Sem avaliações</SelectItem>
                <SelectItem value="5">5 Estrelas</SelectItem>
                <SelectItem value="4">4+ Estrelas</SelectItem>
                <SelectItem value="3">3+ Estrelas</SelectItem>
                <SelectItem value="2">2+ Estrelas</SelectItem>
                <SelectItem value="1">1+ Estrela</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery || filterStatus !== "all" || filterBrand !== "all"
                ? "Tente ajustar os filtros de pesquisa"
                : "Comece a adicionar os seus produtos eletrónicos para gerir as garantias"}
            </p>
            {!searchQuery && filterStatus === "all" && filterBrand === "all" && (
              <Link href="/registar">
                <Button data-testid="button-add-first-product">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
