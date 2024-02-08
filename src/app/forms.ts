import {
    AbstractControl,
    FormControl,
    FormControlStatus,
    FormGroup,
    Validators
} from '@angular/forms';


import { Observable, Subject, map, merge, of } from 'rxjs';
import { debounceTime, mergeMap, shareReplay, startWith } from 'rxjs/operators';
import { isEmpty } from './obj-utilities';
import { AyaValidators } from './validators';

export const touchControl =
    (control: AbstractControl) => (fn: () => void) => () => {
        fn();
        control.markAllAsTouched();
    };

/**
 *
 * @param form The form group to monitor to evaluate disabled state for button element.
 * @returns An observable that emits true when the form is invalid and dirty, or pristine.
 */
export const disableUntilReady = (form: FormGroup): Observable<boolean> => {
    const markedPristine = monkeyPatchMarkAsPristine(form);

    return merge(markedPristine, form.statusChanges, form.valueChanges).pipe(
        startWith(true),
        map(() => (form.invalid && form.dirty) || form.pristine)
    );
};

/**
 * For the material asterisk to display, the internal control needs the Validators.required
 * validator applied directly to it. This function ensures the required validator is
 * added when appropriate.
 *
 * @param source Containing abstract control
 * @param target Internal abstract control
 */
export const inheritRequired = (
    source: AbstractControl,
    target: AbstractControl
) => {
    if (
        source.hasValidator(Validators.required) &&
        !target.hasValidator(Validators.required)
    ) {
        target.addValidators(Validators.required);
    }
};

export const inheritMinAsRequired = (
    source: AbstractControl,
    target: AbstractControl
) => {
    const m = getMinParamValue(source);
    if (m === undefined) {
        return;
    }

    if (!hasControlMinAsRequired(target)) {
        target.addValidators(AyaValidators.minAsRequired(m));
        target.addValidators(Validators.required);
    }
};

export const inheritMinIdentifiableAsRequired = (
    source: AbstractControl,
    target: AbstractControl
) => {
    const m = getMinParamValue(source);
    if (m === undefined) {
        return;
    }

    if (!isEmpty(m) && !hasControlMinIdentifiableAsRequiredValidator(target)) {
        target.addValidators(AyaValidators.minIdentifiableAsRequired(m));
    }
};

const getMinError = (control: AbstractControl) => {
    const validator = control.validator;

    if (validator === null) {
        return false;
    }

    return validator(new FormControl(-Infinity));
};

export const hasControlMinIdentifiableAsRequiredValidator = (
    control: AbstractControl
): boolean => {
    const validator = control.validator;

    if (validator === null) {
        return false;
    }

    const errors = validator(new FormControl({ id: -Infinity }));
    console.log(errors);
    return errors ? 'minId' in errors : false;
};

export const hasControlMinValidator = (control: AbstractControl): boolean => {
    const errors = getMinError(control);
    return errors ? 'min' in errors : false;
};

export const hasControlNilValidator = (control: AbstractControl): boolean => {
    return control.validator === null || control.hasValidator(Validators.nullValidator);
};

export const getMinParamValue = (
    control: AbstractControl
): number | undefined => {
    const errors = getMinError(control);

    if (errors && 'min' in errors) {
        return Number(errors.min.min ?? -1);
    }
    return undefined;
};

export const hasControlMinAsRequired = (control: AbstractControl): boolean => {
    const validator = control.validator;

    if (validator === null) {
        return false;
    }

    const errors = validator(new FormControl(-Infinity));
    return errors ? 'required' in errors : false;
};

export const FormActionsEnum = {
    markAsUntouched: 'markAsUntouched',
    markAsTouched: 'markAsTouched',
    markAsDirty: 'markAsDirty',
    markAsPristine: 'markAsPristine',
    valueChanges: 'valueChanges',
    statusChanges: 'statusChanges'
};

export type FormActivityAction =
    (typeof FormActionsEnum)[keyof typeof FormActionsEnum];

/**
 * Creates an Observable that emits a boolean value indicating whether the form is ready or not.
 * The form is considered ready when it is valid and dirty, or untouched.
 * This function also monkey patches all markAs* functions of the form to emit values when they are called.
 *
 * @param form The form group to observe.
 * @returns An Observable that emits a boolean value indicating whether the form is ready or not.
 */
export const onAllFormActivity = <
    T extends AbstractControl | AbstractControl[]
>(
    form: T,
    options: { enableOnPristine: boolean } = { enableOnPristine: false }
): Observable<{ disabled: boolean; form: T; action: FormActivityAction }> => {
    const {
        markedAsPristine$,
        markedAsDirty$,
        markedAsTouched$,
        markedAsUntouched$
    } = monkeyPatchAllMarkAs(form);

    return merge(
        markedAsUntouched$.pipe(
            map<void, FormActivityAction>(() => FormActionsEnum.markAsUntouched)
        ),
        markedAsTouched$.pipe(
            map<void, FormActivityAction>(() => FormActionsEnum.markAsTouched)
        ),
        markedAsPristine$.pipe(
            map<void, FormActivityAction>(() => FormActionsEnum.markAsPristine)
        ),
        markedAsDirty$.pipe(
            map<void, FormActivityAction>(() => FormActionsEnum.markAsDirty)
        ),
        mergedFormEvents(form, 'valueChanges').pipe(
            map<any, FormActivityAction>(() => FormActionsEnum.valueChanges)
        ),
        mergedFormEvents(form, 'statusChanges').pipe(
            map<FormControlStatus, FormActivityAction>(
                () => FormActionsEnum.statusChanges
            )
        )
    ).pipe(
        debounceTime(1),
        map((action: FormActivityAction) => ({
            disabled: Array.isArray(form)
                ? (form.some((f) => f.invalid) && form.some((f) => f.dirty)) ||
                  form.every((f) => f.pristine)
                : (form.invalid && form.dirty) ||
                  (form.invalid && options.enableOnPristine) ||
                  (!options.enableOnPristine && form.pristine),
            form,
            action
        }))
    );
};

const mergedFormEvents = <T extends AbstractControl | AbstractControl[]>(
    form: T,
    changesMethod: keyof AbstractControl
): Observable<any> =>
    Array.isArray(form)
        ? of(...form).pipe(mergeMap((f) => f[changesMethod]))
        : form[changesMethod];

/**
 * Monkey patches all markAs* functions to return observables to destruct.
 *
 * @param control The form group to patch.
 * @returns An object with observables for each markAs* function.
 */
export const monkeyPatchAllMarkAs = (
    control: AbstractControl | AbstractControl[]
) => ({
    markedAsPristine$: Array.isArray(control)
        ? mergeAbstractControlArrayObservables(control, (c) =>
              monkeyPatchMarkAsPristine(c)
          )
        : monkeyPatchMarkAsPristine(control),
    markedAsDirty$: Array.isArray(control)
        ? mergeAbstractControlArrayObservables(control, (c) =>
              monkeyPatchMarkAsDirty(c)
          )
        : monkeyPatchMarkAsPristine(control),
    markedAsUntouched$: Array.isArray(control)
        ? mergeAbstractControlArrayObservables(control, (c) =>
              monkeyPatchMarkAsUntouched(c)
          )
        : monkeyPatchMarkAsUntouched(control),
    markedAsTouched$: Array.isArray(control)
        ? mergeAbstractControlArrayObservables(control, (c) =>
              monkeyPatchMarkAsTouched(c)
          )
        : monkeyPatchMarkAsTouched(control)
});

/**
 * Merges all Abstract Controls a single Observable.
 *
 * @param controls An array of AbstractControls.
 * @param fn A function that takes an AbstractControl and returns an Observable.
 * @returns An Observable that merges all the Observables returned by the function `fn` for each control.
 */
const mergeAbstractControlArrayObservables = (
    controls: AbstractControl[],
    fn: (control: AbstractControl) => Observable<void>
) => of(...controls.map((c) => fn(c))).pipe(mergeMap((x) => x));

/**
 * Monkey patches the markAsdDirty() method of the provided form control.
 * This function creates an observable that emits a value every time the form control's markAsDirty() method is called.
 *
 * @param form The form control to patch.
 * @returns An Observable that emits a value every time the form control's markAsDirty() method is called.
 */
const monkeyPatchMarkAsDirty = (form: AbstractControl): Observable<void> => {
    const dirtyObservableForm = form as AbstractControl & {
        _dirty$?: Subject<void>;
        dirty$: Observable<void>;
    };

    if (dirtyObservableForm._dirty$ === undefined) {
        dirtyObservableForm._dirty$ = new Subject<void>();
        dirtyObservableForm.dirty$ = dirtyObservableForm._dirty$
            .asObservable()
            .pipe(shareReplay({ bufferSize: 1, refCount: true }));

        const origFunc = form.markAsDirty;
        form.markAsDirty = (
            ...args: [opts?: { onlySelf?: boolean | undefined } | undefined]
        ) => {
            origFunc.apply(form, args);
            dirtyObservableForm._dirty$?.next();
        };
    }
    return dirtyObservableForm.dirty$;
};

/**
 * Monkey patches the markAsPristine() method of the provided form control.
 * This function creates an observable that emits a value every time the form control's markAsPristine() method is called.
 *
 * @param form The form control to patch.
 * @returns An Observable that emits a value every time the form control's markAsPristine() method is called.
 */
const monkeyPatchMarkAsPristine = (form: AbstractControl): Observable<void> => {
    const pristineObservableForm = form as AbstractControl & {
        _pristine$?: Subject<void>;
        pristine$: Observable<void>;
    };

    if (pristineObservableForm._pristine$ === undefined) {
        pristineObservableForm._pristine$ = new Subject<void>();
        pristineObservableForm.pristine$ = pristineObservableForm._pristine$
            .asObservable()
            .pipe(shareReplay({ bufferSize: 1, refCount: true }));

        const origFunc = form.markAsPristine;
        form.markAsPristine = (
            ...args: [opts?: { onlySelf: boolean | undefined } | undefined]
        ) => {
            origFunc.apply(form, args);
            pristineObservableForm._pristine$?.next();
        };
    }
    return pristineObservableForm.pristine$;
};

/**
 * Monkey patches the markAsTouched() method of the provided form control.
 * This function creates an observable that emits a value every time the form control's markAsTouched() method is called.
 *
 * @param form The form control to patch.
 * @returns An Observable that emits a value every time the form control's markAsTouched() method is called.
 */

const monkeyPatchMarkAsTouched = (form: AbstractControl): Observable<void> => {
    const touchedObservableForm = form as AbstractControl & {
        _touched$?: Subject<void>;
        touched$?: Observable<void>;
    };

    if (touchedObservableForm.touched$ === undefined) {
        touchedObservableForm._touched$ = new Subject<void>();
        touchedObservableForm.touched$ = touchedObservableForm._touched$
            .asObservable()
            .pipe(shareReplay({ bufferSize: 1, refCount: true }));

        const origFunc = form.markAsTouched;
        form.markAsTouched = (
            ...args: [opts?: { onlySelf?: boolean | undefined } | undefined]
        ) => {
            origFunc.apply(form, args);
            touchedObservableForm._touched$?.next();
        };
    }
    return touchedObservableForm.touched$;
};

/**
 * Monkey patches the markAsUntouched() method of the provided form control.
 * This function creates an observable that emits a value every time the form control's markAsUntouched() method is called.
 *
 * @param form The form control to patch.
 * @returns An Observable that emits a value every time the form control's markAsUntouched() method is called.
 */
const monkeyPatchMarkAsUntouched = (
    form: AbstractControl
): Observable<void> => {
    const untouchedObservableForm = form as AbstractControl & {
        _untouched$?: Subject<void>;
        untouched$: Observable<void>;
    };

    if (untouchedObservableForm._untouched$ === undefined) {
        untouchedObservableForm._untouched$ = new Subject<void>();
        untouchedObservableForm.untouched$ = untouchedObservableForm._untouched$
            .asObservable()
            .pipe(shareReplay({ bufferSize: 1, refCount: true }));

        const origFunc = form.markAsUntouched;
        form.markAsUntouched = (
            ...args: [opts?: { onlySelf?: boolean | undefined } | undefined]
        ) => {
            origFunc.apply(form, args);
            untouchedObservableForm._untouched$?.next();
        };
    }

    return untouchedObservableForm.untouched$;
};
