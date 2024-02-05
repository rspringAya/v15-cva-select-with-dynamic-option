import {
    AbstractControl,
    FormControl,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { Identifiable } from '../list-item.models';
import { isOfType } from '../obj-utilities';

export const MinIdentifiableAsRequiredErrorKey = 'required';

/**
 * This validator accepts a minimum value for cases where a form control is non-nullable.
 * When the control value is below the minimum value, a { required : true } error is returned.
 *
 * @param min Minimum value to be considered `required` fulfilled.
 * @returns ValidatorFn
 */
export const minIdentifiableAsRequired =
    (min: number) =>
    (control: AbstractControl): ValidationErrors | null => {
        const val = control.value;
        if (
            (val ?? undefined) !== undefined &&
            val !== Infinity &&
            val !== -Infinity &&
            isOfType<Identifiable>(val, ['id'])
        ) {
            const { id } = val;
            const errors = Validators.min(min)(new FormControl(id))
                ? {
                      [MinIdentifiableAsRequiredErrorKey]: true,
                      minId: {
                          minId: min,
                          actualId: id
                      }
                  }
                : null;
            return errors;
        }
        return null;
    };
