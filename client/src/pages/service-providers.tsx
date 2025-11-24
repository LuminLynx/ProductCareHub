import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Phone, Mail, Globe, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { ServiceProvider } from "@shared/schema";

type ServiceProviderWithReviews = ServiceProvider & {
  reviews?: Array<{ rating: number; comment?: string }>;
};

const districts = [
  "Lisboa", "Porto", "Braga", "Aveiro", "Covilhã", "Faro",
  "Setúbal", "Leiria", "Santarém", "Castelo Branco", "Beja", "Évora"
];

export default function ServiceProviders() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: providers, isLoading } = useQuery<ServiceProviderWithReviews[]>({
    queryKey: ["/api/service-providers", selectedDistrict],
    queryFn: async () => {
      const url = new URL("/api/service-providers", window.location.origin);
      if (selectedDistrict !== "all") {
        url.searchParams.set("district", selectedDistrict);
      }
      const response = await fetch(url);
      return response.json();
    },
  });

  const filteredProviders = providers?.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Provedores de Serviço</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Provedores de Serviço</h1>
            <p className="text-muted-foreground mt-2">
              Encontre empresas de assistência para produtos fora de garantia
            </p>
          </div>
          <Link href="/provedores/registar">
            <Button size="lg" data-testid="button-register-provider">
              <Plus className="h-5 w-5 mr-2" />
              Registar Empresa
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Pesquisar empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-provider"
            />
          </div>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-district">
              <SelectValue placeholder="Distrito" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Distritos</SelectItem>
              {districts.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Providers Grid */}
        {filteredProviders.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum provedor encontrado neste distrito
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProviders.map((provider) => {
              const avgRating = provider.reviews && provider.reviews.length > 0
                ? Math.round(provider.reviews.reduce((sum, r) => sum + r.rating, 0) / provider.reviews.length)
                : 0;

              return (
                <Card key={provider.id} className="p-6 hover-elevate" data-testid={`card-provider-${provider.id}`}>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{provider.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {provider.city}, {provider.district}
                          </p>
                        </div>
                      </div>
                      {avgRating > 0 && (
                        <div className="flex flex-col items-end">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < avgRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">{avgRating}/5</span>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      {provider.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${provider.phone}`} className="hover:underline">
                            {provider.phone}
                          </a>
                        </div>
                      )}
                      {provider.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${provider.email}`} className="hover:underline">
                            {provider.email}
                          </a>
                        </div>
                      )}
                      {provider.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={provider.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Supported Brands */}
                    {provider.supportedBrands && provider.supportedBrands.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Marcas Suportadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {provider.supportedBrands.slice(0, 3).map((brand, i) => (
                            <Badge key={i} variant="outline">{brand}</Badge>
                          ))}
                          {provider.supportedBrands.length > 3 && (
                            <Badge variant="outline">+{provider.supportedBrands.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reviews Count */}
                    {provider.reviews && provider.reviews.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {provider.reviews.length} avaliações
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
