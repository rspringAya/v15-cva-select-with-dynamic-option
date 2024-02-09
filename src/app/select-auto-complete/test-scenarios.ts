import {
    FormControlStatus,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { ListItem, SelectedItem } from '../list-item.models';
import { AyaValidators } from '../validators';

interface TestScenarios {
    initialValue: SelectedItem | number;
    validatorName: string;
    validator: ValidatorFn;
    validatorStatus: FormControlStatus;
    errors: ValidationErrors | null;
    expectedInternalValue: ListItem | null;
    expectedParentValue: SelectedItem | number;
    expectedParentValidatorStatus: FormControlStatus;
}

export const initialValueAndValidatorTestScenarios: TestScenarios[] = [
    {
        initialValue: null,
        validatorName: 'Validators.nullValidator',
        validator: Validators.nullValidator,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: null,
        expectedParentValue: null,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: null,
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'INVALID',
        errors: {
            required: true,
            minId: {
                minId: 0,
                actualId: -1
            }
        },
        expectedInternalValue: { id: -1, name: '' },
        expectedParentValidatorStatus: 'VALID',
        expectedParentValue: null
    },
    {
        initialValue: null,
        validatorName: 'AyaValidators.minAsRequired(1)',
        validator: AyaValidators.minAsRequired(1),
        validatorStatus: 'INVALID',
        errors: {
            required: true,
            minId: {
                minId: 1,
                actualId: -1
            }
        },
        expectedInternalValue: { id: -1, name: '' },
        expectedParentValue: null,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: 0,
        validatorName: 'Validators.nullValidator',
        validatorStatus: 'VALID',
        errors: null,
        validator: Validators.nullValidator,
        expectedInternalValue: { id: 0, name: 'test 0' },
        expectedParentValue: 0,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: 0,
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: 0, name: 'test 0' },
        expectedParentValue: 0,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: 0,
        validatorName: 'AyaValidators.minAsRequired(1)',
        validator: AyaValidators.minAsRequired(1),
        validatorStatus: 'INVALID',
        errors: {
            required: true,
            minId: {
                minId: 1,
                actualId: -1
            }
        },
        expectedInternalValue: { id: -1, name: '' },
        expectedParentValue: 0,
        expectedParentValidatorStatus: 'INVALID'
    },
    {
        initialValue: -1,
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'INVALID',
        errors: {
            required: true,
            minId: {
                minId: 0,
                actualId: -1
            }
        },
        expectedInternalValue: { id: -1, name: '' },
        expectedParentValue: -1,
        expectedParentValidatorStatus: 'INVALID'
    },
    {
        initialValue: -1,
        validatorName: 'AyaValidators.minAsRequired(1)',
        validator: AyaValidators.minAsRequired(1),
        validatorStatus: 'INVALID',
        errors: {
            required: true,
            minId: {
                minId: 1,
                actualId: -1
            }
        },
        expectedInternalValue: { id: -1, name: '' },
        expectedParentValue: -1,
        expectedParentValidatorStatus: 'INVALID'
    },
    {
        initialValue: { id: -1, name: '' },
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'INVALID',
        errors: {
            required: true,
            minId: {
                minId: 0,
                actualId: -1
            }
        },
        expectedInternalValue: { id: -1, name: '' },
        expectedParentValue: { id: -1, name: '' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: -1, name: '' },
        validatorName: 'AyaValidators.minAsRequired(1)',
        validator: AyaValidators.minAsRequired(1),
        validatorStatus: 'INVALID',
        errors: {
            required: true,
            minId: {
                minId: 1,
                actualId: -1
            }
        },
        expectedInternalValue: { id: -1, name: '' },
        expectedParentValue: { id: -1, name: '' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: 0, name: 'test 0' },
        validatorName: 'Validators.nullValidator',
        validator: Validators.nullValidator,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: 0, name: 'test 0' },
        expectedParentValue: { id: 0, name: 'test 0' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: 0, name: 'test 0' },
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: 0, name: 'test 0' },
        expectedParentValue: { id: 0, name: 'test 0' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: 0, name: '' },
        validatorName: 'AyaValidators.minAsRequired(1)',
        validator: AyaValidators.minAsRequired(1),
        validatorStatus: 'INVALID',
        errors: {
            required: true,
            minId: {
                minId: 1,
                actualId: -1
            }
        },
        expectedInternalValue: { id: -1, name: '' },
        expectedParentValue: { id: 0, name: '' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: 1, name: 'test 1' },
        validatorName: 'Validators.nullValidator',
        validator: Validators.nullValidator,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: 1, name: 'test 1' },
        expectedParentValue: { id: 1, name: 'test 1' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: 1, name: 'test 1' },
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: 1, name: 'test 1' },
        expectedParentValue: { id: 1, name: 'test 1' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: 1, name: 'test 1' },
        validatorName: 'AyaValidators.minAsRequired(1)',
        validator: AyaValidators.minAsRequired(1),
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: 1, name: 'test 1' },
        expectedParentValue: { id: 1, name: 'test 1' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: -1,
        validatorName: 'Validators.nullValidator',
        validator: Validators.nullValidator,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: -1, name: '' },
        expectedParentValue: -1,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: { id: -1, name: '' },
        validatorName: 'Validators.nullValidator',
        validator: Validators.nullValidator,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: -1, name: '' },
        expectedParentValue: { id: -1, name: '' },
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: '1',
        validatorName: 'Validators.nullValidator',
        validator: Validators.nullValidator,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: 1, name: 'test 1' },
        expectedParentValue: '1',
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: '1',
        validatorName: 'AyaValidators.minAsRequired(0)',
        validator: AyaValidators.minAsRequired(0),
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: 1, name: 'test 1' },
        expectedParentValue: '1',
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: '1',
        validatorName: 'AyaValidators.minAsRequired(1)',
        validator: AyaValidators.minAsRequired(1),
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: { id: 1, name: 'test 1' },
        expectedParentValue: '1',
        expectedParentValidatorStatus: 'VALID'
    }
];
