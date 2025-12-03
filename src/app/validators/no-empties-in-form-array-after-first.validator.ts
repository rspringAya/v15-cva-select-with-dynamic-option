import {
    AbstractControl,
    FormArray,
    FormGroup,
    ValidationErrors
} from '@angular/forms';

export const ContainsEmptyAfterFirstErrorKey = 'containsEmptyAfterFirst';

/**
 * Creates a custom validator function that checks if any control in a FormArray after
 * the first control has an empty value for a specified control name.
 *
 * @template T - The type of the FormGroup.
 * @template K - The type of the control name.
 * @param controlNames - The name of the control to check for empty values.
 * @returns A function that takes an AbstractControl as an argument and returns
 * either a ValidationErrors object or null.
 */
export const noEmptiesInFormArrayAfterFirst =
    <T extends FormGroup, K extends keyof T['controls']>(
        controlNames?: K | K[]
    ) =>
    (control: AbstractControl): ValidationErrors | null => {
        if (control instanceof FormArray) {
            const hasEmpty = Array.from(control.controls)
                .slice(1)
                .some((c) => {
                    if (c.value) {
                        if (Array.isArray(controlNames)) {
                            return controlNames.some((i) => c.value[i]);
                        }
                        return c.value[controlNames];
                    }
                });
            return hasEmpty
                ? { [ContainsEmptyAfterFirstErrorKey]: true }
                : null;
        }
        return null;
    };
