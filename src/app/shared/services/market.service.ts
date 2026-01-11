import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';
import { HeadquarterSelectionService } from './headquarter-selection.service';

export type Market = {
  id: number;
  fileUrl: string;
  value: number;
  purchaseDate: string;
  importDate: string;
  itemCount: number;
  items?: MarketItem[];
  headquarterId?: number;
  headquarterName?: string;
  planId?: number;
  planName?: string;
};

export type MarketCreatePayload = {
  file: File;
  value: number;
  purchaseDate: string;
  headquarterId?: number;
  planId?: number;
};

export type MarketItem = {
  name: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  category?: string;
};

export type MarketUpdatePayload = {
  file?: File;
  value: number;
  purchaseDate: string;
  headquarterId?: number;
  planId?: number;
};

type MarketsResponse = {
  markets: Market[];
};

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private headquarterSelection = inject(HeadquarterSelectionService);

  constructor(private http: HttpClient) {}

  // Importa nota de mercado enviando arquivo e metadados.
  // Inclui sede e plano quando informados.
  create(market: MarketCreatePayload): Observable<Market> {
    const formData = new FormData();
    formData.append('file', market.file);
    formData.append('value', market.value.toString());
    formData.append('purchaseDate', market.purchaseDate);
    if (market.headquarterId) {
      formData.append('headquarterId', market.headquarterId.toString());
    }
    if (market.planId) {
      formData.append('planId', market.planId.toString());
    }

    return this.http.post<Market>(apiUrls.market, formData);
  }

  // Atualiza compra de mercado permitindo troca opcional do arquivo.
  // Serializa valores numéricos como string para multipart.
  update(marketId: number, market: MarketUpdatePayload): Observable<Market> {
    const formData = new FormData();
    formData.append('value', market.value.toString());
    formData.append('purchaseDate', market.purchaseDate);
    if (market.headquarterId) {
      formData.append('headquarterId', market.headquarterId.toString());
    }
    if (market.planId) {
      formData.append('planId', market.planId.toString());
    }
    if (market.file) {
      formData.append('file', market.file);
    }

    return this.http.put<Market>(`${apiUrls.market}/${marketId}`, formData);
  }

  // Remove registro de mercado pelo id.
  // Retorna Observable vazio para encadear.
  delete(marketId: number): Observable<void> {
    return this.http.delete<void>(`${apiUrls.market}/${marketId}`);
  }

  // Busca compra específica e adapta nomes de campos retornados.
  // Suporta resposta com wrapper `market` ou objeto direto.
  getById(marketId: number): Observable<Market> {
    return this.http.get<Record<string, unknown>>(`${apiUrls.market}/${marketId}`).pipe(
      map((response) => {
        const data: Record<string, unknown> = (response['market'] as Record<string, unknown>) ?? response;
        return this.normalizeMarket(data);
      })
    );
  }

  // Lista compras aplicando filtro opcional de sede.
  // Normaliza itens e valores convertendo strings numéricas.
  getAll(): Observable<Market[]> {
    const params = this.headquarterSelection.buildParams();
    return this.http.get<MarketsResponse | Market[]>(apiUrls.market, { params }).pipe(
      map((response) => {
        const markets = Array.isArray(response) ? response : response.markets ?? [];
        return markets.map((data) => this.normalizeMarket(data as Record<string, unknown>));
      })
    );
  }

  // Converte payloads variados em `Market` coerente.
  // Trata itens, alias de campos e números em string.
  private normalizeMarket(data: Record<string, unknown>): Market {
    const rawItems = (data['items'] ?? data['products'] ?? data['productItems']) as unknown;
    const items: MarketItem[] | undefined = Array.isArray(rawItems)
      ? rawItems.map((item: any) => ({
          name: (item?.name ?? item?.product_name ?? item?.productName ?? '') as string,
          quantity: (item?.quantity ?? item?.qty ?? item?.amount) as number | undefined,
          unitPrice:
            typeof item?.unit_price === 'string'
              ? parseFloat(item.unit_price)
              : (item?.unit_price ?? item?.unitPrice ?? item?.price ?? item?.unitValue) as number | undefined,
          totalPrice:
            typeof item?.total_price === 'string'
              ? parseFloat(item.total_price)
              : (item?.total_price ?? item?.totalPrice ?? item?.total ?? item?.value) as number | undefined,
          category: (item?.category ?? item?.type ?? '') as string
        }))
      : undefined;

    return {
      id: (data['id'] as number) ?? 0,
      fileUrl: (data['file_url'] ?? data['fileUrl'] ?? '') as string,
      value: typeof data['value'] === 'string' ? parseFloat(data['value']) : (data['value'] as number) ?? 0,
      purchaseDate: (data['purchase_date'] ?? data['purchaseDate'] ?? '') as string,
      importDate: (data['import_date'] ?? data['importDate'] ?? '') as string,
      itemCount: (data['item_count'] ?? data['itemCount'] ?? 0) as number,
      items,
      headquarterId: (data['headquarter_id'] ?? data['headquarterId']) as number | undefined,
      headquarterName: (data['headquarter_name'] ?? data['headquarterName']) as string | undefined,
      planId: (data['plan_id'] ?? data['planId']) as number | undefined,
      planName: (data['plan_name'] ?? data['planName']) as string | undefined
    };
  }
}
