import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { insertBrandSchema } from "@shared/schema";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

const brandFormSchema = insertBrandSchema.extend({
  name: z.string().min(2, "Nome da marca é obrigatório"),
  supportEmail: z.string().email("Email de suporte inválido"),
  category: z.string().min(1, "Categoria é obrigatória"),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

export default function CreateBrand() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      supportEmail: "",
      supportPhone: "",
      website: "",
      category: "Informática",
    },
  });

  const createBrandMutation = useMutation({
    mutationFn: async (data: BrandFormValues) => {
      return apiRequest("/api/brands", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Marca criada com sucesso e disponível para todos os utilizadores!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setSubmitted(true);
      form.reset();
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar marca",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/marcas">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Adicionar Marca</h1>
            <p className="text-muted-foreground mt-1">
              Não encontrou a sua marca? Adicione-a aqui e estará disponível para todos
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => createBrandMutation.mutate(data))}
              className="space-y-6"
            >
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Marca *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: LG, Samsung, Bosch..."
                        {...field}
                        data-testid="input-brand-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Support Email Field */}
              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Suporte *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="support@brand.com"
                        {...field}
                        data-testid="input-support-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Support Phone Field */}
              <FormField
                control={form.control}
                name="supportPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone de Suporte</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+351 XXX XXX XXX"
                        {...field}
                        data-testid="input-support-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website Field */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.brand.com/support"
                        {...field}
                        data-testid="input-website"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Field */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Informática, Eletrodomésticos..."
                        {...field}
                        data-testid="input-category"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createBrandMutation.isPending}
                data-testid="button-submit-brand"
              >
                {createBrandMutation.isPending ? "Criando..." : "Criar Marca"}
              </Button>

              {submitted && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  ✓ Marca criada com sucesso! Já está disponível para registar produtos.
                </div>
              )}
            </form>
          </Form>
        </Card>

        {/* Info Box */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Informações Importantes</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• A marca será imediatamente disponibilizada para todos os utilizadores</li>
            <li>• Certifique-se que a informação está correta antes de submeter</li>
            <li>• O email de suporte será usado para enviar pedidos de garantia automáticos</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
