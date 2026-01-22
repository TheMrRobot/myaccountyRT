import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { customerService } from '@/services/customer.service';
import { Quote } from '@/types';

const quoteSchema = z.object({
  type: z.enum(['SALE', 'RENTAL']),
  customerId: z.string().min(1, 'Client requis'),
  validUntil: z.string().optional(),
  rentalStartDate: z.string().optional(),
  rentalEndDate: z.string().optional(),
  includedKm: z.string().optional(),
  extraKmRate: z.string().optional(),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  terms: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  quote?: Quote;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function QuoteForm({ quote, onSubmit, onCancel, isLoading }: QuoteFormProps) {
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: quote ? {
      type: quote.type,
      customerId: quote.customerId,
      validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '',
      rentalStartDate: quote.rentalStartDate ? new Date(quote.rentalStartDate).toISOString().split('T')[0] : '',
      rentalEndDate: quote.rentalEndDate ? new Date(quote.rentalEndDate).toISOString().split('T')[0] : '',
      includedKm: quote.includedKm?.toString() || '',
      extraKmRate: quote.extraKmRate?.toString() || '',
      customerNotes: quote.customerNotes || '',
      internalNotes: quote.internalNotes || '',
      terms: quote.terms || '',
    } : {
      type: 'SALE',
      customerId: '',
      validUntil: '',
      rentalStartDate: '',
      rentalEndDate: '',
      includedKm: '',
      extraKmRate: '',
      customerNotes: '',
      internalNotes: '',
      terms: '',
    },
  });

  const quoteType = watch('type');

  const handleFormSubmit = (data: QuoteFormData) => {
    const submitData: any = {
      type: data.type,
      customerId: data.customerId,
      validUntil: data.validUntil || undefined,
      customerNotes: data.customerNotes || undefined,
      internalNotes: data.internalNotes || undefined,
      terms: data.terms || undefined,
    };

    if (data.type === 'RENTAL') {
      submitData.rentalStartDate = data.rentalStartDate || undefined;
      submitData.rentalEndDate = data.rentalEndDate || undefined;
      submitData.includedKm = data.includedKm ? parseInt(data.includedKm) : undefined;
      submitData.extraKmRate = data.extraKmRate ? parseFloat(data.extraKmRate) : undefined;
    }

    return onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type de devis *</Label>
          <Select
            value={quoteType}
            onValueChange={(value) => setValue('type', value as 'SALE' | 'RENTAL')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SALE">Vente</SelectItem>
              <SelectItem value="RENTAL">Location</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerId">Client *</Label>
          <Select
            value={watch('customerId')}
            onValueChange={(value) => setValue('customerId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {customers?.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.type === 'B2B'
                    ? customer.companyName
                    : `${customer.firstName} ${customer.lastName}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.customerId && (
            <p className="text-sm text-red-600">{errors.customerId.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="validUntil">Valable jusqu'au</Label>
        <Input
          id="validUntil"
          type="date"
          {...register('validUntil')}
        />
      </div>

      {quoteType === 'RENTAL' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rentalStartDate">Date de début</Label>
              <Input
                id="rentalStartDate"
                type="date"
                {...register('rentalStartDate')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentalEndDate">Date de fin</Label>
              <Input
                id="rentalEndDate"
                type="date"
                {...register('rentalEndDate')}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="includedKm">Kilométrage inclus</Label>
              <Input
                id="includedKm"
                type="number"
                placeholder="1000"
                {...register('includedKm')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extraKmRate">Tarif km supplémentaire (€)</Label>
              <Input
                id="extraKmRate"
                type="number"
                step="0.01"
                placeholder="0.50"
                {...register('extraKmRate')}
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="customerNotes">Notes pour le client</Label>
        <Textarea
          id="customerNotes"
          {...register('customerNotes')}
          placeholder="Notes visibles par le client..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="internalNotes">Notes internes</Label>
        <Textarea
          id="internalNotes"
          {...register('internalNotes')}
          placeholder="Notes internes (non visibles par le client)..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="terms">Conditions générales</Label>
        <Textarea
          id="terms"
          {...register('terms')}
          placeholder="Conditions générales de vente/location..."
          rows={3}
        />
      </div>

      {!quote && (
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Après création du devis, vous pourrez ajouter des lignes de produits/services
            depuis la page de détail du devis.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : quote ? 'Mettre à jour' : 'Créer le devis'}
        </Button>
      </div>
    </form>
  );
}
