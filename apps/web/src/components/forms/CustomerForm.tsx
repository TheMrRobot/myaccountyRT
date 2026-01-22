import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/types';

const customerSchema = z.object({
  type: z.enum(['B2B', 'B2C']),
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  vatNumber: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.type === 'B2B') {
    return !!data.companyName;
  }
  return !!data.firstName && !!data.lastName;
}, {
  message: 'Veuillez remplir les champs requis selon le type de client',
  path: ['type'],
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CustomerForm({ customer, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || {
      type: 'B2B',
      companyName: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      vatNumber: '',
      notes: '',
    },
  });

  const customerType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Type de client *</Label>
        <Select
          value={customerType}
          onValueChange={(value) => setValue('type', value as 'B2B' | 'B2C')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="B2B">Entreprise (B2B)</SelectItem>
            <SelectItem value="B2C">Particulier (B2C)</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {customerType === 'B2B' ? (
        <div className="space-y-2">
          <Label htmlFor="companyName">Nom de l'entreprise *</Label>
          <Input
            id="companyName"
            {...register('companyName')}
            placeholder="Acme Inc."
          />
          {errors.companyName && (
            <p className="text-sm text-red-600">{errors.companyName.message}</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="Jean"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Dupont"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="contact@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+32 2 123 45 67"
          />
        </div>
      </div>

      {customerType === 'B2B' && (
        <div className="space-y-2">
          <Label htmlFor="vatNumber">Numéro de TVA</Label>
          <Input
            id="vatNumber"
            {...register('vatNumber')}
            placeholder="BE0123456789"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Notes internes..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : customer ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
