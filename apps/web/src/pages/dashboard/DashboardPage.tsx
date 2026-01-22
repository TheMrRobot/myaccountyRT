import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Receipt, TrendingUp, AlertCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { quoteService } from '@/services/quote.service';
import { formatCurrency, formatShortDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function DashboardPage() {
  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quoteService.getAll(),
  });

  // Calculate stats
  const stats = quotes ? {
    totalQuotes: quotes.length,
    draftQuotes: quotes.filter(q => q.status === 'DRAFT').length,
    sentQuotes: quotes.filter(q => q.status === 'SENT').length,
    acceptedQuotes: quotes.filter(q => q.status === 'ACCEPTED').length,
    totalAmount: quotes.reduce((sum, q) => sum + Number(q.total), 0),
  } : null;

  const recentQuotes = quotes?.slice(0, 5) || [];

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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Devis totaux
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalQuotes || 0}</div>
            <p className="text-xs text-gray-500">
              {stats?.draftQuotes || 0} brouillon(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              En attente
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sentQuotes || 0}</div>
            <p className="text-xs text-gray-500">Devis envoyés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Acceptés
            </CardTitle>
            <Receipt className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.acceptedQuotes || 0}</div>
            <p className="text-xs text-gray-500">Devis acceptés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Chiffre d'affaires
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalAmount || 0)}
            </div>
            <p className="text-xs text-gray-500">Total des devis</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quotes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Devis récents</CardTitle>
              <CardDescription>Les 5 derniers devis créés</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to="/quotes">Voir tous les devis</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentQuotes.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Aucun devis pour le moment
            </div>
          ) : (
            <div className="space-y-4">
              {recentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{quote.number}</p>
                      <Badge className={getStatusColor(quote.status)}>
                        {getStatusLabel(quote.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {quote.customer?.companyName ||
                       `${quote.customer?.firstName} ${quote.customer?.lastName}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatShortDate(quote.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(Number(quote.total))}</p>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/quotes/${quote.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
