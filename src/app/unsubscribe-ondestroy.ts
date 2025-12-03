import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export abstract class UnsubscribeOnDestroy implements OnDestroy {
    protected d$: Subject<void>;

    constructor() {
        this.d$ = new Subject<void>();
    }

    ngOnDestroy() {
        this.d$.next();
        this.d$.complete();
    }
}
