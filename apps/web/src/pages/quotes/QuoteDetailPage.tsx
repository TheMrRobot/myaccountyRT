import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { quoteService } from '@/services/quote.service';
import { formatCurrency, formatShortDate, getStatusColor, getStatusLabel, downloadFile } from '@/lib/utils';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: quote, isLoading } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => quoteService.getOne(id!),
    enabled: !!id,
  });

  const handleDownloadPdf = async () => {
    if (!quote) return;
    try {
      const blob = await quoteService.downloadPdf(quote.id);
      downloadFile(blob, `${quote.number}.pdf`);
      toast.success('PDF téléchargé');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Devis introuvable</p>
          <Button asChild className="mt-4">
            <Link to="/quotes">Retour aux devis</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/quotes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Devis {quote.number}</h1>
            <p className="text-gray-600">
              {quote.type === 'SALE' ? 'Devis de vente' : 'Devis de location'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Numéro</p>
                  <p className="mt-1 text-sm">{quote.number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <Badge className={`mt-1 ${getStatusColor(quote.status)}`}>
                    {getStatusLabel(quote.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1 text-sm">{formatShortDate(quote.date)}</p>
                </div>
                {quote.validUntil && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Valable jusqu'au
                    </p>
                    <p className="mt-1 text-sm">{formatShortDate(quote.validUntil)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lines */}
          <Card>
            <CardHeader>
              <CardTitle>Lignes du devis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        Description
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-500">
                        Qté
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-500">
                        P.U. HT
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-500">
                        Total HT
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {quote.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="py-3 text-sm">
                          {line.isSection ? (
                            <strong>{line.description}</strong>
                          ) : (
                            line.description
                          )}
                        </td>
                        <td className="py-3 text-right text-sm">
                          {!line.isSection && line.quantity}
                        </td>
                        <td className="py-3 text-right text-sm">
                          {!line.isSection && formatCurrency(Number(line.unitPrice))}
                        </td>
                        <td className="py-3 text-right font-medium text-sm">
                          {!line.isSection && formatCurrency(Number(line.subtotal))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total HT</span>
                    <span className="font-medium">
                      {formatCurrency(Number(quote.subtotal))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>TVA</span>
                    <span className="font-medium">
                      {formatCurrency(Number(quote.taxAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total TTC</span>
                    <span>{formatCurrency(Number(quote.total))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">
                  {quote.customer?.companyName ||
                   `${quote.customer?.firstName} ${quote.customer?.lastName}`}
                </p>
                {quote.customer?.vatNumber && (
                  <p className="text-gray-600">TVA: {quote.customer.vatNumber}</p>
                )}
                {quote.customer?.email && (
                  <p className="text-gray-600">{quote.customer.email}</p>
                )}
                {quote.customer?.phone && (
                  <p className="text-gray-600">{quote.customer.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.customerNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes client</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-gray-600">
                  {quote.customerNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
