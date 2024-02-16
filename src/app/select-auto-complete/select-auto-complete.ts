import { Component, Input } from '@angular/core';
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
import {
    MatAutocomplete,
    MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import {
    BehaviorSubject,
    Observable,
    Subject,
    combineLatest,
    merge,
    of
} from 'rxjs';
import {
    debounceTime,
    delay,
    distinctUntilChanged,
    filter,
    map,
    scan,
    switchMap,
    takeUntil,
    tap,
    withLatestFrom
} from 'rxjs/operators';
import { hasControlNilValidator, inheritMinAsRequired } from '../forms';
import {
    ItemOrId,
    ListItem,
    SelectedItem,
    isListItem,
    resolveToNumberOrId
} from '../list-item.models';
import { beginsWith, isEmpty, isOfType } from '../obj-utilities';
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
    implements Validator, ControlValueAccessor
{
    @Input() placeholder = '';

    readonly inputControl: FormControl<string | null>;

    private readonly panelOpened$ = new Subject<string>();
    constructor(private readonly _fb: FormBuilder) {
        super();
        this.inputControl = this._fb.control<string | null>('');
        this._initializeFilteredList();
    }

    private readonly _setPotentialExactMatch$ = new Subject<void>();

    /**
     * This BehaviorSubject will either emit the ListItems to subscribers, or hold the ListItems until subscribed to.
     */
    private readonly __listOptions$ = new BehaviorSubject<ListItem[]>([]);

    /**
     * The BehaviorSubject starts as an empty array, but this initial empty array must be ignored and wait for
     * the first non-empty array. After which,
     */
    readonly listOptions$ = this.__listOptions$.pipe(
        scan(
            (acc: { skip: boolean; value: ListItem[] }, curr: ListItem[]) => {
                if (curr?.length > 0 || acc.value?.length !== 0 || !acc.skip) {
                    // If current array is non-empty, or after the first non-empty array has been received,
                    // we stop skipping emissions.
                    return { skip: false, value: curr };
                }
                // Initially skip, but don't change the value yet.
                return acc;
            },
            { skip: true, value: [] }
        ),
        // Only emit when skip is false
        filter((acc) => !acc.skip),
        map((acc) => acc.value),
        tap((l) => {
            this._setValueIfInListItemOrClear(l);
        })
    );

    @Input()
    set listItems(value: ListItem[]) {
        this.__listOptions$.next(value);
    }

    filteredOptions$: Observable<ListItem[]> | undefined;

    panelOpened(auto: MatAutocomplete) {
        this.panelOpened$.next('');
    }

    openPanel(a: MatAutocompleteTrigger) {
        a.openPanel();
        this.panelOpened$.next('');
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
        this._waitForInputValue(v).subscribe(({ asString, initValInvalid }) => {
            const changedFromOriginalListItemValue =
                isOfType<ListItem>(v, ['name']) &&
                v.name !== asString &&
                v.name !== '' &&
                v.id !== -1;
            const originalIsInvalidPrimitive =
                ((typeof v === 'string' || typeof v === 'number') && initValInvalid) &&
                    v !== -1;
            // *********************
            // Typically using { emitEvent: false }, because the parent form is the source of writeValue. Therefore
            // emitting changes to the parent is redundant and falsely sets dirty to true.
            // There is one exception to that. If the value written to the control is a list item that is
            // not in the options, the control should emit the change from the invalid value to empty.
            if (changedFromOriginalListItemValue || originalIsInvalidPrimitive) {
                this.inputControl.setValue(asString);
            } else {
                this.inputControl.setValue(asString, { emitEvent: false });
            }
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
            .pipe(
                distinctUntilChanged(),
                switchMap((t) => this.findItemInList(t)),
                map((id) => {
                    if (isEmpty(id, [-1])) {
                        return hasControlNilValidator(this.inputControl)
                            ? null
                            : -1;
                    }
                    return id;
                })
            )
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
        inheritMinAsRequired(control, this.inputControl);
        const { value } = this.inputControl;
        if (
            !isEmpty(value, [-1]) &&
            !this.__listOptions$.value.find(
                (i) => i.name === this.inputControl.value
            )
        ) {
            this.inputControl.setErrors({ invalidOption: 'invalid option' });
        }
        return this.inputControl.errors;
    }

    OnValidatorChange = () => {};
    registerOnValidatorChange(fn: any): void {
        this.OnValidatorChange = fn;
    }
    // #endregion Validator

    onBlur() {
        this.onTouched();
        this._setPotentialExactMatch$.next();
    }
    displayFn = (item?: ItemOrId | null): string =>
        // This is to prevent the number (id) value from being displayed until a listItem is selected.
        (isListItem(item) ? item.name : '') ?? '';

    trackById = (item: any) => item.id;

    private _initializeFilteredList(): void {
        this.filteredOptions$ = combineLatest([
            this._onTypingOrTrigger(),
            this.listOptions$
        ]).pipe(
            map(([val, listItems]) => this._filterOptions(val, listItems)),
            takeUntil(this.d$)
            /** As mentioned above, Adding `@UntilDestroy()` causes the following error:
             * NG0204: Token InjectionToken NgValidators is missing a ɵprov definition.
             * Investigate later.
             */
            //untilDestroyed(this)
        );

        this._setPotentialExactMatch$
            .asObservable()
            .pipe(withLatestFrom(this.filteredOptions$))
            .subscribe(([_, options]) => {
                if (
                    options?.length === 1 &&
                    // TODO: This version of the control only ever sets the control
                    // value to a string. Potentially get rid of this check.
                    !isListItem(this.inputControl.value)
                ) {
                    this.inputControl.setValue(options[0].name ?? null);
                } else {
                    this.inputControl.updateValueAndValidity();
                }
            });
    }

    private _onTypingOrTrigger() {
        return merge(
            this.panelOpened$.pipe(map(() => '')),
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
            if (value !== foundValue?.name) {
                this.inputControl.setValue(value, { emitEvent: false });
            }
        } else {
            this._clearValue();
        }
    }

    private _selectedItemToId(item: SelectedItem | number) {
        return isListItem(item) ? item?.id : Number(item);
    }

    private _clearValue() {
        this.inputControl.setValue('', { emitEvent: false });
    }

    private findItemInList(val: string | null) {
        return this.listOptions$.pipe(
            map((l) => {
                const r = l.find((i) => i.name === val);
                return r?.id ?? null;
            })
        );
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

    /**
     *
     * @param val This holds the incoming value until listItems ReplaySubject has a value.
     * Note, the ReplaySubject will
     * @returns Observable<any>
     */
    private _waitForInputValue<T extends ItemOrId | string | null>(
        val: T
    ): Observable<{ asString: string | null; initValInvalid: boolean }> {
        // combineLatest ensures listOptions$ has a value or waits to emit until it does
        return combineLatest([
            of(val).pipe(map((v) => resolveToNumberOrId(v))),
            this.listOptions$
        ]).pipe(
            /**
             * The delay(1) is because the inner control.setValue is called before
             * registerOnChanges happens. When the initial value does not match any id/name
             * combinations in the provided ListItems and the ListItems are immediately
             * available, onChange is not called, which must happen to emit the change to an
             * "empty" value to the parent.
             */
            delay(1),
            // Create a distinct list of listOptions that match the id from the value(s).
            map(([v, o]) => {
                if (isOfType<ListItem>(val, ['id', 'name'])) {
                    const r = o.find(
                        (i) => i.id === val.id && i.name === val.name
                    )?.name;
                    return { asString: r ?? '', initValInvalid: r === undefined };
                }
                const r = o.find((i) => i.id === v)?.name;
                return { asString: r ?? '', initValInvalid: r === undefined };
            })
        );
    }
}
