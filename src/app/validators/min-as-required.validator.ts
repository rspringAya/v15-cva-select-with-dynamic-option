import {
    AbstractControl,
    FormControl,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { Identifiable } from '../list-item.models';
import { isOfType } from '../obj-utilities';

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
    (control: AbstractControl): ValidationErrors | null => {
        const { value } = control;

        if (
            (value ?? undefined) !== undefined &&
            value !== Infinity &&
            value !== -Infinity &&
            isOfType<Identifiable>(value, ['id'])
        ) {
            const { id } = value;
            const errors = Validators.min(min)(new FormControl(id))
                ? {
                      [MinAsRequiredErrorKey]: true,
                      min: {
                          min,
                          actual: id
                      }
                  }
                : null;
            return errors;
        }
        
        return Validators.min(min)(control)  || value === null
            ? {
                  [MinAsRequiredErrorKey]: true,
                  min: {
                      min,
                      actual: control.value
                  }
              }
            : null;
    };
