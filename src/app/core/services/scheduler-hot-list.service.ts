import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subscription, merge, timer } from 'rxjs';
import { HotListService } from './hot-list.service';

@Injectable({ providedIn: 'root' })
export class SchedulerHotListService implements OnDestroy {
  enabled = signal(false);

  private sub = new Subscription();

  constructor(private hotListService: HotListService) {
    // Slots: 7:30 AM y 14:00
    const slots: [number, number][] = [
      [7, 30],
      [14, 0],
    ];

    const triggers$ = slots.map(([h, m]) =>
      timer(this.msUntilNext(h, m), 24 * 60 * 60 * 1000)
    );

    this.sub = merge(...triggers$).subscribe(() => {
      if (this.enabled()) {
        this.hotListService.generarLista();
      }
    });
  }

  private msUntilNext(hour: number, minute: number): number {
    const now = new Date();
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }
    return next.getTime() - now.getTime();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
