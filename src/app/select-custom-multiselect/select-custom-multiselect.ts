import {
    AfterContentChecked,
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
    NgControl,
    ValidationErrors,
    Validator
} from '@angular/forms';
import { Observable, ReplaySubject, combineLatest, of } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

interface ListItem {
    id: number;
    name: string;
}

/** @title Select with custom trigger text */
@Component({
    selector: 'select-custom-multiselect',
    templateUrl: 'select-custom-multiselect.html',
    styleUrls: ['select-custom-multiselect.css'],
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: SelectCustomTriggerExample,
            multi: true
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: SelectCustomTriggerExample,
            multi: true
        }
    ]
})
export class SelectCustomTriggerExample
    implements
        OnInit,
        AfterViewInit,
        AfterViewChecked,
        OnChanges,
        Validator,
        ControlValueAccessor
{
    readonly toppings: FormControl<ListItem[]>;

    constructor(
        private readonly _fb: FormBuilder,
        // private readonly ngControl: NgControl
    ) {
        // this.ngControl.valueAccessor = this;
        this.toppings = this._fb.nonNullable.control<ListItem[]>([]);
        this.toppingsOptions$.subscribe((e) => console.log('new options', e));
    }

    readonly toppingsOptions$ = new ReplaySubject<ListItem[]>();

    @Input()
    set toppingsOptions(value: ListItem[]) {
        this.toppingsOptions$.next(value);
    }

    // #region CVA
    writeValue(val: any): void {
        console.log('writeValue');
        this.waitForInputValue(val).subscribe((t) => this.toppings.setValue(t));
    }

    private waitForInputValue(val: any): Observable<any> {
        // Wait for the toppingsOptions$ to emit, then complete
        return combineLatest([
            of(val).pipe(map((v) => new Set(v))),
            this.toppingsOptions$
        ]).pipe(
            map(([v, o]): ListItem[] => o.filter((i) => v.has(i.id))),
            take(1)
        );
    }

    private extractIds(items: (ListItem | number)[]): number[] {
        return items.map((item) => (typeof item === 'number' ? item : item.id));
    }

    registerOnChange(fn: any) {
        console.log('registerOnChange');
        this.onChange = fn;
        this.toppings.valueChanges
            .pipe(
                filter(Boolean),
                map((t) => t.map((i) => i.id))
            )
            .subscribe((t) => {
                this.onChange(t);
                this.OnValidatorChange();
            });
    }

    registerOnTouched(fn: any): void {
        console.log('registerOnTouched');
    }
    setDisabledState?(isDisabled: boolean): void {
        console.log('setDisabledState');
    }
    // #endregion end CVA

    // #region Validator
    validate(control: AbstractControl<any, any>): ValidationErrors | null {
        console.log('validate');
        return this.toppings.errors;
    }
    onChange = (val: number[]) => {};
    registerOnValidatorChange(fn: any): void {
        console.log('registerOnValidatorChange');
        this.OnValidatorChange = fn;
    }
    // #endregion Validator
    OnValidatorChange = () => {};
    ngOnChanges(changes: SimpleChanges): void {
        console.log('ngOnChanges');
        if (changes.toppingsOptions) {
            this.waitForInputValue(
                this.extractIds(this.toppings.value)
            ).subscribe((value) => {
                // Use the value here to update your form or perform other actions
                this.toppings.patchValue(value);
            });
        }
    }
    ngAfterViewChecked(): void {
        console.log('ngAfterViewChecked');
    }
    // ngAfterContentChecked(): void {
    //     console.log('ngAfterContentChecked');
    // }
    ngAfterViewInit(): void {
        console.log('ngAfterViewInit');
    }
    ngOnInit(): void {
        console.log('ngOnInit');
    }
}
