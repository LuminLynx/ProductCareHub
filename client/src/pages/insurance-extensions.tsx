import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Users, Award } from "lucide-react";

const insurancePartners = [
  {
    id: 1,
    name: "SeguroTech Plus",
    logo: "🛡️",
    rating: 4.8,
    reviews: 342,
    coverage: "Cobertura até 5 anos",
    price: "A partir de €49/ano",
    features: ["Reparação ou substituição", "Assistência técnica 24/7", "Sem limites de valor"],
    contact: "info@segurotech.pt"
  },
  {
    id: 2,
    name: "Garantia Europa",
    logo: "🏆",
    rating: 4.6,
    reviews: 521,
    coverage: "Extensão de garantia europeia",
    price: "A partir de €39/ano",
    features: ["Cobertura em toda a UE", "Sem franquia", "Cobertura de danos acidentais"],
    contact: "suporte@garantiaeuropa.pt"
  },
  {
    id: 3,
    name: "ProAssistência",
    logo: "⚙️",
    rating: 4.7,
    reviews: 289,
    coverage: "Proteção total de produto",
    price: "A partir de €59/ano",
    features: ["Reparação em casa", "Recolha e entrega gratuita", "Sem documentação complexa"],
    contact: "comercial@proassistencia.pt"
  }
];

export default function InsuranceExtensions() {
  return (
    <div className="min-h-screen bg-background py-12 space-y-12">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Estender a Sua Garantia</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Proteja os seus produtos para além da garantia de 3 anos com as melhores seguradoras de Portugal
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-3">
            <Clock className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold">Cobertura Extra</h3>
            <p className="text-sm text-muted-foreground">Proteja o seu produto por mais anos após o termo da garantia</p>
          </Card>
          <Card className="p-6 text-center space-y-3">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold">Proteção Completa</h3>
            <p className="text-sm text-muted-foreground">Inclui reparações, substituições e assistência técnica</p>
          </Card>
          <Card className="p-6 text-center space-y-3">
            <Award className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold">Parceiros Certificados</h3>
            <p className="text-sm text-muted-foreground">Entidades reguladoras e com maior avaliação em Portugal</p>
          </Card>
        </div>

        {/* Insurance Partners */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Seguradoras Parceiras</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {insurancePartners.map(partner => (
              <Card key={partner.id} className="p-6 hover-elevate space-y-4 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-4xl mb-2">{partner.logo}</div>
                    <h3 className="text-xl font-bold">{partner.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < Math.floor(partner.rating) ? "text-yellow-400" : "text-muted-foreground"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">({partner.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Cobertura</p>
                    <p className="font-medium">{partner.coverage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preço</p>
                    <p className="text-lg font-bold text-primary">{partner.price}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Características:</p>
                  <ul className="space-y-1">
                    {partner.features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-auto space-y-2">
                  <p className="text-xs text-muted-foreground text-center">{partner.contact}</p>
                  <Button className="w-full" data-testid={`button-contact-${partner.id}`}>
                    Contactar {partner.name}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <Card className="p-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Como Funciona?</h3>
            <ol className="space-y-3 text-blue-800 dark:text-blue-200">
              <li className="flex gap-3">
                <span className="font-bold text-blue-900 dark:text-blue-100">1.</span>
                <span>Escolha uma seguradora e contacte-os para obter uma proposta</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-900 dark:text-blue-100">2.</span>
                <span>Após aceitar, registe a extensão de garantia na sua conta Warranty Manager</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-900 dark:text-blue-100">3.</span>
                <span>Os dados de garantia serão atualizados automaticamente na aplicação</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-900 dark:text-blue-100">4.</span>
                <span>Receberá notificações com a nova data de expiração da garantia estendida</span>
              </li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
