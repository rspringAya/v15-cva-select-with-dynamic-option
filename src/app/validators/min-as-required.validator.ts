import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export const MinAsRequiredErrorKey = 'required';

/**
 * This validator accepts a minimum value for cases where a form control is non-nullable.
 * When the control value is below the minimum value, a { required : true } error is returned.
 *
 * @param min Minimum value to be considered `required` fulfilled.
 * @returns ValidatorFn
 */
export const minAsRequired =
    (min: number) =>
    (control: AbstractControl): ValidationErrors | null =>
        Validators.min(min)(control)
            ? {
                  [MinAsRequiredErrorKey]: true,
                  min: {
                      min,
                      actual: control.value
                  }
              }
            : null;
