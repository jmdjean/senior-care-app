import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, defer } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly pendingCount$ = new BehaviorSubject(0);

  readonly loading$ = this.pendingCount$.pipe(
    map((count) => count > 0),
    distinctUntilChanged()
  );

  // Encapsula observables incrementando contador de requisições pendentes ao iniciar.
  // Garante decremento único ao finalizar com sucesso, erro ou conclusão.
  track<T>(source$: Observable<T>): Observable<T> {
    return defer(() => {
      this.increment();
      let handled = false;

      const finalizeOnce = () => {
        if (!handled) {
          handled = true;
          this.decrement();
        }
      };

      return source$.pipe(
        tap({
          next: finalizeOnce,
          error: finalizeOnce,
          complete: finalizeOnce
        })
      );
    });
  }

  // Aumenta o contador de requisições em progresso.
  // Usado internamente pelo fluxo de track.
  private increment(): void {
    this.pendingCount$.next(this.pendingCount$.value + 1);
  }

  // Reduz o contador de requisições, sem deixar ficar negativo.
  // Protege contra múltiplas finalizações simultâneas.
  private decrement(): void {
    const nextValue = this.pendingCount$.value - 1;
    this.pendingCount$.next(nextValue < 0 ? 0 : nextValue);
  }
}
