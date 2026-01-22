import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Download, FileSpreadsheet, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { quoteService } from '@/services/quote.service';
import { formatCurrency, formatShortDate, getStatusColor, getStatusLabel, downloadFile } from '@/lib/utils';
import { Quote } from '@/types';

export default function QuotesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: quotes, isLoading, refetch } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quoteService.getAll(),
  });

  const filteredQuotes = quotes?.filter((quote) => {
    const matchesSearch =
      quote.number.toLowerCase().includes(search.toLowerCase()) ||
      quote.customer?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      quote.customer?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      quote.customer?.lastName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = async () => {
    try {
      const blob = await quoteService.exportCsv();
      downloadFile(blob, `quotes-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Export CSV téléchargé');
    } catch (error) {
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  const handleExportXlsx = async () => {
    try {
      const blob = await quoteService.exportXlsx();
      downloadFile(blob, `quotes-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Export Excel téléchargé');
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await quoteService.duplicate(id);
      toast.success('Devis dupliqué avec succès');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la duplication');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Devis</h1>
          <p className="text-gray-600">Gérez vos devis de vente et de location</p>
        </div>
        <Button asChild>
          <Link to="/quotes/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par numéro ou client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="DRAFT">Brouillon</option>
                <option value="SENT">Envoyé</option>
                <option value="ACCEPTED">Accepté</option>
                <option value="REJECTED">Refusé</option>
                <option value="EXPIRED">Expiré</option>
              </select>

              <Button variant="outline" onClick={handleExportCsv}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" onClick={handleExportXlsx}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des devis ({filteredQuotes?.length || 0})</CardTitle>
          <CardDescription>
            {filteredQuotes?.length === 0
              ? 'Aucun devis trouvé'
              : `${filteredQuotes?.length} devis trouvé(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuotes && filteredQuotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-gray-500">
                      Numéro
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-500">
                      Client
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-500">
                      Type
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-500">
                      Statut
                    </th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-500">
                      Total TTC
                    </th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="py-4">
                        <Link
                          to={`/quotes/${quote.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {quote.number}
                        </Link>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {formatShortDate(quote.date)}
                      </td>
                      <td className="py-4 text-sm">
                        {quote.customer?.companyName ||
                         `${quote.customer?.firstName} ${quote.customer?.lastName}`}
                      </td>
                      <td className="py-4 text-sm">
                        {quote.type === 'SALE' ? 'Vente' : 'Location'}
                      </td>
                      <td className="py-4">
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusLabel(quote.status)}
                        </Badge>
                      </td>
                      <td className="py-4 text-right font-medium">
                        {formatCurrency(Number(quote.total))}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/quotes/${quote.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicate(quote.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              Aucun devis trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
