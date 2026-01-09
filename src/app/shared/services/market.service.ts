import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiUrls } from '../urls';

export type Market = {
  id: number;
  fileUrl: string;
  value: number;
  purchaseDate: string;
  importDate: string;
  itemCount: number;
  items?: MarketItem[];
};

export type MarketCreatePayload = {
  file: File;
  value: number;
  purchaseDate: string;
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
};

type MarketsResponse = {
  markets: Market[];
};

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  constructor(private http: HttpClient) {}

  create(market: MarketCreatePayload): Observable<Market> {
    const formData = new FormData();
    formData.append('file', market.file);
    formData.append('value', market.value.toString());
    formData.append('purchaseDate', market.purchaseDate);

    return this.http.post<Market>(apiUrls.market, formData);
  }

  update(marketId: number, market: MarketUpdatePayload): Observable<Market> {
    const formData = new FormData();
    formData.append('value', market.value.toString());
    formData.append('purchaseDate', market.purchaseDate);
    if (market.file) {
      formData.append('file', market.file);
    }

    return this.http.put<Market>(`${apiUrls.market}/${marketId}`, formData);
  }

  delete(marketId: number): Observable<void> {
    return this.http.delete<void>(`${apiUrls.market}/${marketId}`);
  }

  getById(marketId: number): Observable<Market> {
    return this.http.get<Record<string, unknown>>(`${apiUrls.market}/${marketId}`).pipe(
      map((response) => {
        const data: Record<string, unknown> = (response['market'] as Record<string, unknown>) ?? response;
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
          items
        };
      })
    );
  }

  getAll(): Observable<Market[]> {
    return this.http.get<MarketsResponse>(apiUrls.market).pipe(
      map((response) => response.markets ?? [])
    );
  }
}
