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

  private increment(): void {
    this.pendingCount$.next(this.pendingCount$.value + 1);
  }

  private decrement(): void {
    const nextValue = this.pendingCount$.value - 1;
    this.pendingCount$.next(nextValue < 0 ? 0 : nextValue);
  }
}