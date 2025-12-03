import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export const MustBeErrorKey = 'mustBe';
export const mustBeValidator =
    (shouldBeValue: boolean): ValidatorFn =>
    (control: AbstractControl): ValidationErrors | null =>
        control.value !== shouldBeValue
            ? {
                  [MustBeErrorKey]: {
                      shouldBeValue,
                      actualValue: control.value
                  }
              }
            : null;
