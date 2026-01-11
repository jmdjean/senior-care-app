import { HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, of, shareReplay, tap } from 'rxjs';
import { Headquarter, HeadquarterService } from './headquarter.service';

@Injectable({
  providedIn: 'root'
})
export class HeadquarterSelectionService {
  private readonly headquarterService = inject(HeadquarterService);
  private readonly storageKey = 'selectedHeadquarterId';

  private readonly headquartersList = signal<Headquarter[]>([]);
  private readonly selectedHeadquarterIdSignal = signal<number | null>(null);
  private readonly initialized = signal(false);
  private loading$?: Observable<Headquarter[]>;

  readonly headquarters = this.headquartersList.asReadonly();
  readonly selectedHeadquarterId = this.selectedHeadquarterIdSignal.asReadonly();
  readonly selectedHeadquarter = computed(() => {
    const id = this.selectedHeadquarterIdSignal();
    if (id === null) return null;
    return this.headquartersList().find((headquarter) => headquarter.id === id) ?? null;
  });

  // Garante que a lista de sedes seja carregada uma única vez, reutilizando chamada em curso.
  // Retorna imediatamente se já estiver inicializado.
  ensureLoaded(): Observable<Headquarter[]> {
    if (this.initialized()) {
      return of(this.headquartersList());
    }

    if (this.loading$) {
      return this.loading$;
    }

    this.loading$ = this.fetchAndApply({ preferStored: true });

    return this.loading$;
  }

  // Recarrega a lista de sedes ignorando cache atual, reutilizando chamada em progresso.
  // Útil para forçar atualização de dados.
  reload(): Observable<Headquarter[]> {
    if (this.loading$) {
      return this.loading$;
    }

    this.loading$ = this.fetchAndApply({ preferStored: false });

    return this.loading$;
  }

  // Define a sede selecionada e persiste a escolha localmente.
  // Aceita null para representar seleção de todas as sedes.
  setSelectedHeadquarter(headquarterId: number | null): void {
    this.selectedHeadquarterIdSignal.set(headquarterId);
    this.persistSelectedId(headquarterId);
  }

  // Constrói HttpParams com a sede selecionada e extras opcionais.
  // Retorna undefined quando não há parâmetros para enviar.
  buildParams(
    extra?: Record<string, string | number | boolean | null | undefined>
  ): HttpParams | undefined {
    const headquarterId = this.selectedHeadquarterIdSignal();
    const params: Record<string, string> = {};

    if (headquarterId !== null) {
      params['headquarterId'] = headquarterId.toString();
    }

    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        if (value === null || value === undefined) continue;
        params[key] = String(value);
      }
    }

    return Object.keys(params).length ? new HttpParams({ fromObject: params }) : undefined;
  }

  // Persiste o id da sede no localStorage para restaurar escolhas futuras.
  // Usa o marcador 'all' para representar nenhuma sede selecionada.
  private persistSelectedId(id: number | null): void {
    if (id === null) {
      localStorage.setItem(this.storageKey, 'all');
      return;
    }
    localStorage.setItem(this.storageKey, id.toString());
  }

  // Lê o id da sede armazenado no localStorage e converte para número.
  // Retorna null quando não há sede ou quando o valor salvo é inválido.
  private getStoredHeadquarterId(): number | null {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return null;
    if (stored === 'all') return null;
    const parsed = Number.parseInt(stored, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  // Busca sedes na API, aplica seleção inicial (persistida ou primeira) e cacheia o resultado.
  // Libera referência de loading quando concluir para permitir novas chamadas.
  private fetchAndApply(options: { preferStored: boolean }): Observable<Headquarter[]> {
    return this.headquarterService.getAll().pipe(
      tap((headquarters) => {
        this.headquartersList.set(headquarters);

        const storedId = options.preferStored ? this.getStoredHeadquarterId() : this.selectedHeadquarterIdSignal();
        const firstId = headquarters[0]?.id ?? null;
        const initialId = storedId === null
          ? null
          : headquarters.some((hq) => hq.id === storedId)
            ? storedId
            : firstId;

        this.selectedHeadquarterIdSignal.set(initialId);
        this.persistSelectedId(initialId);
        this.initialized.set(true);
      }),
      finalize(() => {
        this.loading$ = undefined;
      }),
      shareReplay(1)
    );
  }
}
