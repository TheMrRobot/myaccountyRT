import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuoteForm from '@/components/forms/QuoteForm';
import { quoteService } from '@/services/quote.service';

export default function QuoteCreatePage() {
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: quoteService.create,
    onSuccess: (quote) => {
      toast.success('Devis créé avec succès');
      navigate(`/quotes/${quote.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du devis');
    },
  });

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/quotes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouveau devis</h1>
          <p className="text-gray-600">Créez un nouveau devis de vente ou de location</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du devis</CardTitle>
          <CardDescription>
            Remplissez les informations de base du devis. Vous pourrez ajouter les lignes de produits/services après création.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuoteForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/quotes')}
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
