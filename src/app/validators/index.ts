import {
    noEmptiesInFormArrayAfterFirst,
    ContainsEmptyAfterFirstErrorKey
} from './no-empties-in-form-array-after-first.validator';
import {
    MinAsRequiredErrorKey,
    minAsRequired
} from './min-as-required.validator';

import { MustBeErrorKey, mustBeValidator } from './must-be.validator';
import {
    minIdentifiableAsRequired,
    MinIdentifiableAsRequiredErrorKey
} from './min-identifiable-as-required.validator';

export const AyaValidators = {
    minAsRequired,
    noEmptiesInFormArrayAfterFirst,
    mustBe: mustBeValidator,
    minIdentifiableAsRequired
};

export const AyaValidatorErrorKeys = {
    containsEmptyAfterFirstErrorKey: ContainsEmptyAfterFirstErrorKey,
    minAsRequiredKey: MinAsRequiredErrorKey,
    mustBeErrorKey: MustBeErrorKey,
    minIdentifiableAsRequiredErrorKey: MinIdentifiableAsRequiredErrorKey
};
