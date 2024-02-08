import {
    AfterViewInit,
    Component,
    Injector,
    Input,
    ViewChild
} from '@angular/core';
import {
    AbstractControl,
    ControlContainer,
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator
} from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatLegacyAutocomplete as MatAutocomplete } from '@angular/material/legacy-autocomplete';
import {
    Observable,
    ReplaySubject,
    Subject,
    combineLatest,
    merge,
    of
} from 'rxjs';
import {
    debounceTime,
    filter,
    map,
    takeUntil,
    tap,
    withLatestFrom
} from 'rxjs/operators';
import {
    hasControlMinAsRequired,
    hasControlNilValidator,
    inheritMinIdentifiableAsRequired
} from '../forms';
import {
    ItemOrId,
    ListItem,
    SelectedItem,
    resolveToNumberOrId,
    isListItem
} from '../list-item.models';
import { beginsWith, isEmpty } from '../obj-utilities';
import { UnsubscribeOnDestroy } from '../unsubscribe-ondestroy';

/** @title Select with custom trigger text */
/* 
Adding `@UntilDestroy()` causes the following error:
NG0204: Token InjectionToken NgValidators is missing a ɵprov definition.
Investigate later.
*/
@Component({
    selector: 'aya-select-auto-complete',
    templateUrl: 'select-auto-complete.html',
    styleUrls: ['select-auto-complete.css'],
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: SelectAutoComplete,
            multi: true
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: SelectAutoComplete,
            multi: true
        }
    ],
    host: { focus: 'focus()' }
})
export class SelectAutoComplete
    extends UnsubscribeOnDestroy
    implements AfterViewInit, Validator, ControlValueAccessor
{
    @Input() placeholder = '';

    @ViewChild('auto')
    auto!: MatAutocomplete;

    readonly inputControl: FormControl<ListItem | null>;

    private readonly _parentForm: AbstractControl | null;

    constructor(
        private readonly _fb: FormBuilder,
        private readonly inj: Injector
    ) {
        super();
        this._parentForm = this.inj.get(ControlContainer).control;
        if (this._parentForm) {
            this._derivedEmpty = this._deriveEmpty(this._parentForm);
        }

        this.inputControl = this._fb.control<ListItem | null>(
            this._derivedEmpty
        );
    }

    private readonly _setPotentialExactMatch$ = new Subject<void>();
    private readonly _listOptions$ = new ReplaySubject<ListItem[]>(1);
    /**
     * This ReplaySubject will either emit the ListItems to subscribers, or hold the ListItems until subscribed to.
     */
    readonly listOptions$ = this._listOptions$.asObservable().pipe(
        filter(Boolean),
        tap((l) => {
            this._setValueIfInListItemOrClear(l);
        })
    );

    @Input()
    set listItems(value: ListItem[]) {
        this._listOptions$.next(value);
    }

    filteredOptions$: Observable<ListItem[]> | undefined;

    panelManuallyOpened$ = new Subject<void>();
    openPanel(a: MatAutocompleteTrigger) {
        a.openPanel();
        this.panelManuallyOpened$.next();
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
    writeValue(v: ItemOrId | null): void {
        const val = resolveToNumberOrId(v);
        this._waitForInputValue(val).subscribe((t) => {
            // emitEvent here is false, because the parent form is the source of writeValue. Therefore
            // emitting changes to the parent is redundant and falsely sets dirty to true.
            this.inputControl.setValue(t, { emitEvent: false });
        });
    }

    onChange = (val: number | null) => {};
    registerOnChange(fn: any) {
        this.onChange = fn;

        /**
         * As a common practice, this is where the control value updates should be filtered/transformed
         * before emitting updated values to the parent form. In this case, the id is being pulled from
         * the ListItem
         */
        this.inputControl.valueChanges
            .pipe(map((t) => resolveToNumberOrId(t)))
            .subscribe((t) => {
                this.onChange(t);
                // TODO: Do we really need to call this? Calling it makes valueChanges on the parent form emit twice.
                // Supposedly this is to ensure the parent form re-runs validity checks, but that shouldn't be necessary
                // if valueChanges is already emitted.
                // this.OnValidatorChange();
            });
    }

    onTouched = () => {};
    registerOnTouched(fn: any): void {
        if (this.inputControl) {
            this.onTouched = () => {
                fn.apply(this);
            };
        }
    }

    setDisabledState?(isDisabled: boolean): void {
        if (isDisabled) {
            this.inputControl.disable();
        } else {
            this.inputControl.enable();
        }
    }

    // #endregion end CVA

    // #region Validator
    validate(control: AbstractControl<any, any>): ValidationErrors | null {
        inheritMinIdentifiableAsRequired(control, this.inputControl);
        const {value} = this.inputControl;
        if (!hasControlNilValidator(control) && !isListItem(value) && !isEmpty(value, [-1])){
            this.inputControl.setErrors({invalidOption: 'invalid option'});
        }
        return this.inputControl.errors;
    }

    OnValidatorChange = () => {};
    registerOnValidatorChange(fn: any): void {
        this.OnValidatorChange = fn;
    }
    // #endregion Validator

    // #region LifeCycles

    // Only here to log when this happens
    ngAfterViewInit(): void {
        this._initializeFilteredList();
    }
    // #endregion LifeCycles

    onBlur() {
        this.onTouched();
        this._setPotentialExactMatch$.next();
    }
    displayFn = (item?: ItemOrId | null): string =>
        // This is to prevent the number (id) value from being displayed until a listItem is selected.
        (isListItem(item) ? item.name : '') ?? '';

    trackById = (item: any) => item.id;

    /** Not executed until after the view is initialized.
     * This ensures ViewChild(auto) is not undefined. */
    private _initializeFilteredList(): void {
        this.filteredOptions$ = combineLatest([
            this._onTypingOrTrigger(),
            this.listOptions$
        ]).pipe(
            map(([val, listItems]) => this._filterOptions(val, listItems)),
            takeUntil(this.d$)
            //untilDestroyed(this)
        );

        this._setPotentialExactMatch$
            .asObservable()
            .pipe(
                withLatestFrom(this.filteredOptions$)
            )
            .subscribe(([_, options]) => {
                if (options?.length === 1 && !isListItem(this.inputControl.value)) {
                    this.inputControl.setValue(options[0]);
                } else {
                    this.inputControl.updateValueAndValidity();
                }
            });
    }

    private _onTypingOrTrigger() {
        return merge(
            this.panelManuallyOpened$.pipe(map(() => '')),
            this.auto?.opened.pipe(map(() => '')),
            this.inputControl.valueChanges.pipe(debounceTime(100))
        );
    }

    /**
     * If the value is not in list, clear the input value
     */
    private _setValueIfInListItemOrClear(list: ListItem[]) {
        const { value } = this.inputControl;
        const foundValue = list.find(
            (e) => e.id === this._selectedItemToId(value)
        );

        if (value) {
            // Only set it if it's a new value
            if (value !== foundValue) {
                this.inputControl.setValue(value, { emitEvent: false });
            }
        } else {
            this._clearValue();
        }
    }

    private _selectedItemToId(item: SelectedItem | number) {
        return isListItem(item) ? item?.id : Number(item);
    }

    /**
     * Set to null or -1 based on whether control is required/has min value.
     */
    private _clearValue() {
        this.inputControl.setValue(this._derivedEmpty, { emitEvent: false });
    }

    private _filterOptions(
        val: SelectedItem,
        listItems: ListItem[]
    ): ListItem[] {
        // When val is empty, return all listItems. Otherwise filter by beginsWith.
        return isEmpty(val, ['-1', -1])
            ? listItems
            : listItems.filter((p) =>
                  beginsWith(p.name, isListItem(val) ? val.name : val)
              );
    }

    private _derivedEmpty: ListItem | null = {
        id: -1,
        name: ''
    };

    private _deriveEmpty(control: AbstractControl): ListItem | null {
        if (control.value === null && !hasControlMinAsRequired(control)) {
            return null;
        }
        return { id: -1, name: '' };
    }

    /**
     *
     * @param val This holds the incoming value until listItems ReplaySubject has a value.
     * Note, the ReplaySubject will
     * @returns Observable<any>
     */
    private _waitForInputValue<T extends ItemOrId | null>(
        val: T
    ): Observable<ListItem | null> {
        // combineLatest ensures listOptions$ has a value or waits to emit until it does
        return combineLatest([
            of(val).pipe(map((v) => resolveToNumberOrId(v))),
            this.listOptions$
        ]).pipe(
            // Create a distinct list of listOptions that match the id from the value(s).
            map(
                ([v, o]): ListItem | null =>
                    o.find((i) => i.id === v) ?? this._derivedEmpty
            )
        );
    }
}
