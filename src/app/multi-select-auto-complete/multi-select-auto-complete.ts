import {
    AfterViewChecked,
    AfterViewInit,
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator
} from '@angular/forms';
import { Observable, ReplaySubject, combineLatest, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface ListItem {
    id: number;
    name: string;
}

export type ItemOrId = number | ListItem;

/** @title Select with custom trigger text */
@Component({
    selector: 'multi-select-auto-complete',
    templateUrl: 'multi-select-auto-complete.html',
    styleUrls: ['multi-select-auto-complete.css'],
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: MultiSelectAutoComplete,
            multi: true
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: MultiSelectAutoComplete,
            multi: true
        }
    ]
})
export class MultiSelectAutoComplete
    implements
        OnInit,
        AfterViewInit,
        AfterViewChecked,
        OnChanges,
        Validator,
        ControlValueAccessor
{
    readonly inputControl: FormControl<ListItem[]>;

    constructor(private readonly _fb: FormBuilder) {
        this.inputControl = this._fb.nonNullable.control<ListItem[]>([]);
        this.toppingsOptions$.subscribe((e) => console.log('new options', e));
    }

    /**
     * This ReplaySubject will either emit the ListItems to subscribers, or hold the ListItems until subscribed to.
     */
    readonly toppingsOptions$ = new ReplaySubject<ListItem[]>(1);

    @Input()
    set toppingsOptions(value: ListItem[]) {
        this.toppingsOptions$.next(value);
    }

    // #region CVA
    /**
     * 
     * @param val This is the value coming from the parent form, whether it be the initial value it was
     * constructed with or a later value that has been set by some external source.
     * This is also where the 
     * 
     * Note: This must accept null to support nullable controls. Undefined should technically not come
     * through here if the control typing is being adhered to.
     * 
     */
    writeValue(val: ItemOrId | ItemOrId[] | null): void {
        console.log('writeValue');
        this.waitForInputValue(val).subscribe((t) => this.inputControl.setValue(t));
    }

    onChange = (val: number[]) => {};
    registerOnChange(fn: any) {
        console.log('registerOnChange');
        this.onChange = fn;

        /**
         * As a common practice, this is where the control value updates should be filtered/transformed
         * before emitting updated values to the parent form. In this case, the id is being pulled from
         * the ListItem
         */
        this.inputControl.valueChanges
            .pipe(
                filter(Boolean),
                map((t) => t.map((i) => i.id))
            )
            .subscribe((t) => {
                this.onChange(t);
                this.OnValidatorChange();
            });
    }

    onTouched = () => {};
    registerOnTouched(fn: any): void {
        console.log('registerOnTouched');
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        console.log('setDisabledState');
        if (isDisabled){
            this.inputControl.disable();
        } else {
            this.inputControl.enable();

        }
    }

    // #endregion end CVA

    // #region Validator
    validate(control: AbstractControl<any, any>): ValidationErrors | null {
        console.log('validate');
        return this.inputControl.errors;
    }
    
    OnValidatorChange = () => {};
    registerOnValidatorChange(fn: any): void {
        console.log('registerOnValidatorChange');
        this.OnValidatorChange = fn;
    }
    // #endregion Validator
    
    // Only here to log when this happens
    ngOnChanges(changes: SimpleChanges): void {
        console.log('ngOnChanges');
    }

    // Only here to log when this happens
    ngAfterViewChecked(): void {
        console.log('ngAfterViewChecked');
    }

    // Only here to log when this happens
    ngAfterViewInit(): void {
        console.log('ngAfterViewInit');
    }

    // Only here to log when this happens
    ngOnInit(): void {
        console.log('ngOnInit');
    }

    /**
     *
     * @param val This holds the incoming value until listItems ReplaySubject has a value.
     * Note, the ReplaySubject will
     * @returns Observable<any>
     */
    private waitForInputValue<T extends ItemOrId | ItemOrId[] | null>(
        val: T
    ): Observable<ListItem[]> {
        // combineLatest ensures toppingsOptions$ has a value or waits to emit until it does
        return combineLatest([
            of(val).pipe(map((v) => new Set(Array.isArray(v) ? [...v] : [v]))),
            this.toppingsOptions$
        ]).pipe(
            // Create a distinct list of toppingsOptions that match the id from the value(s).
            map(([v, o]): ListItem[] => o.filter((i) => v.has(i.id)))
        );
    }

    private extractIds(items: (ListItem | number)[]): number[] {
        return items.map((item) => (typeof item === 'number' ? item : item.id));
    }
}
