import {
    FormControlStatus,
    ValidationErrors,
    ValidatorFn
} from '@angular/forms';
import { SelectedItem } from '../list-item.models';
import { AyaValidators } from '../validators';

export interface CvaTestScenarios {
    initialValue: SelectedItem | number;
    validatorName: string;
    validator: ValidatorFn | null;
    validatorStatus: FormControlStatus;
    errors: ValidationErrors | null;
    expectedInternalValue: string | null;
    expectedParentValue: SelectedItem | number;
    expectedParentValidatorStatus: FormControlStatus;
}

// Initial value is sent with an id/name combination that does not match any in the ListItems
export const invalidInitialValueAndValidatorTestScenarios: CvaTestScenarios[] = [
    {
        initialValue: { id: 1, name: 'item from different source' },
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'INVALID',
        errors: {
            required: true
        },
        expectedInternalValue: '',
        // In this case, the parent should get the change to the empty value.
        expectedParentValue: -1,
        expectedParentValidatorStatus: 'INVALID'
    }
];

export const initialValueAndValidatorTestScenarios: CvaTestScenarios[] = [
    {
        initialValue: null,
        validatorName: 'No Validator',
        validator: null,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: '',
        expectedParentValue: null,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: null,
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'INVALID',
        errors: {
            required: true
        },
        expectedInternalValue: '',
        expectedParentValidatorStatus: 'INVALID',
        expectedParentValue: null
    },
    {
        initialValue: 0,
        validatorName: 'No Validator',
        validatorStatus: 'VALID',
        errors: null,
        validator: null,
        expectedInternalValue: 'test 0',
        expectedParentValue: 0,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: 0,
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: 'test 0',
        expectedParentValue: 0,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: -1,
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'INVALID',
        errors: {
            required: true
        },
        expectedInternalValue: '',
        expectedParentValue: -1,
        expectedParentValidatorStatus: 'INVALID'
    },
    {
        initialValue: { id: -1, name: '' },
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'INVALID',
        errors: {
            required: true
        },
        expectedInternalValue: '',
        expectedParentValue: { id: -1, name: '' },
        expectedParentValidatorStatus: 'INVALID'
    },
    {
        initialValue: { id: 0, name: 'test 0' },
        validatorName: 'No Validator',
        validator: null,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: 'test 0',
        expectedParentValue: { id: 0, name: 'test 0' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: 0, name: 'test 0' },
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: 'test 0',
        expectedParentValue: { id: 0, name: 'test 0' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: 1, name: 'test 1' },
        validatorName: 'No Validator',
        validator: null,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: 'test 1',
        expectedParentValue: { id: 1, name: 'test 1' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: 1, name: 'test 1' },
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: 'test 1',
        expectedParentValue: { id: 1, name: 'test 1' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: -1,
        validatorName: 'No Validator',
        validator: null,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: '',
        expectedParentValue: -1,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: -1, name: '' },
        validatorName: 'No Validator',
        validator: null,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: '',
        expectedParentValue: { id: -1, name: '' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: '1',
        validatorName: 'No Validator',
        validator: null,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: 'test 1',
        expectedParentValue: '1',
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: '1',
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: 'test 1',
        expectedParentValue: '1',
        expectedParentValidatorStatus: 'VALID'
    }
];
