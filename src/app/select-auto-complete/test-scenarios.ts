import {
    FormControlStatus,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { SelectedItem } from '../list-item.models';

interface TestScenarios {
    initialValue: SelectedItem | number;
    validatorName: string;
    validator: ValidatorFn;
    validatorStatus: FormControlStatus;
    errors: ValidationErrors | null;
    expectedInternalValue: string | null;
    expectedParentValue: SelectedItem | number;
    expectedParentValidatorStatus: FormControlStatus;
}

export const initialValueAndValidatorTestScenarios = [
    {
        initialValue: null,
        validatorName: 'Validators.nullValidator',
        validator: Validators.nullValidator,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: '',
        expectedParentValue: null,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: null,
        validatorName: 'Validators.required',
        validator: Validators.required,
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
        validatorName: 'Validators.nullValidator',
        validatorStatus: 'VALID',
        errors: null,
        validator: Validators.nullValidator,
        expectedInternalValue: 'test 0',
        expectedParentValue: 0,
        expectedParentValidatorStatus: 'VALID'
    },
    {
        initialValue: 0,
        validatorName: 'Validators.required',
        validator: Validators.required,
        validatorStatus: 'VALID',
        errors: null,
        expectedInternalValue: 'test 0',
        expectedParentValue: 0,
        expectedParentValidatorStatus: 'VALID'
    },
    // {
    //     initialValue: -1,
    //     validatorName: 'Validators.required',
    //     validator: Validators.required,
    //     validatorStatus: 'INVALID',
    //     errors: {
    //         required: true
    //     },
    //     expectedInternalValue: '',
    //     expectedParentValue: -1,
    //     expectedParentValidatorStatus: 'INVALID'
    // },
    // {
    //     initialValue: { id: -1, name: '' },
    //     validatorName: 'Validators.required',
    //     validator: Validators.required,
    //     validatorStatus: 'INVALID',
    //     errors: {
    //         required: true
    //     },
    //     expectedInternalValue: '',
    //     expectedParentValue: { id: -1, name: '' },
    //     expectedParentValidatorStatus: 'VALID'
    // },
    // {
    //     initialValue: { id: 0, name: 'test 0' },
    //     validatorName: 'Validators.nullValidator',
    //     validator: Validators.nullValidator,
    //     validatorStatus: 'VALID',
    //     errors: null,
    //     expectedInternalValue: 'test 0',
    //     expectedParentValue: { id: 0, name: 'test 0' },
    //     expectedParentValidatorStatus: 'VALID'
    // },
    // {
    //     initialValue: { id: 0, name: 'test 0' },
    //     validatorName: 'Validators.required',
    //     validator: Validators.required,
    //     validatorStatus: 'VALID',
    //     errors: null,
    //     expectedInternalValue: 'test 0',
    //     expectedParentValue: { id: 0, name: 'test 0' },
    //     expectedParentValidatorStatus: 'VALID'
    // },
    // {
    //     initialValue: { id: 0, name: '' },
    //     validatorName: 'Validators.required',
    //     validator: Validators.required,
    //     validatorStatus: 'INVALID',
    //     errors: {
    //         required: true
    //     },
    //     expectedInternalValue: '',
    //     expectedParentValue: { id: 0, name: '' },
    //     expectedParentValidatorStatus: 'VALID'
    // },
    // {
    //     initialValue: { id: 1, name: 'test 1' },
    //     validatorName: 'Validators.nullValidator',
    //     validator: Validators.nullValidator,
    //     validatorStatus: 'VALID',
    //     errors: null,
    //     expectedInternalValue: 'test 1',
    //     expectedParentValue: { id: 1, name: 'test 1' },
    //     expectedParentValidatorStatus: 'VALID'
    // },
    // {
    //     initialValue: { id: 1, name: 'test 1' },
    //     validatorName: 'Validators.required',
    //     validator: Validators.required,
    //     validatorStatus: 'VALID',
    //     errors: null,
    //     expectedInternalValue: 'test 1',
    //     expectedParentValue: { id: 1, name: 'test 1' },
    //     expectedParentValidatorStatus: 'VALID'
    // },
    // {
    //     initialValue: -1,
    //     validatorName: 'Validators.nullValidator',
    //     validator: Validators.nullValidator,
    //     validatorStatus: 'VALID',
    //     errors: null,
    //     expectedInternalValue: '',
    //     expectedParentValue: -1,
    //     expectedParentValidatorStatus: 'VALID'
    // },
    // {
    //     initialValue: { id: -1, name: '' },
    //     validatorName: 'Validators.nullValidator',
    //     validator: Validators.nullValidator,
    //     validatorStatus: 'VALID',
    //     errors: null,
    //     expectedInternalValue: '',
    //     expectedParentValue: { id: -1, name: '' },
    //     expectedParentValidatorStatus: 'VALID'
    // },
    // {
    //     initialValue: '1',
    //     validatorName: 'Validators.nullValidator',
    //     validator: Validators.nullValidator,
    //     validatorStatus: 'VALID',
    //     errors: null,
    //     expectedInternalValue: 'test 1',
    //     expectedParentValue: '1',
    //     expectedParentValidatorStatus: 'VALID'
    // },
    // {
    //     initialValue: '1',
    //     validatorName: 'Validators.required',
    //     validator: Validators.required,
    //     validatorStatus: 'VALID',
    //     errors: null,
    //     expectedInternalValue: 'test 1',
    //     expectedParentValue: '1',
    //     expectedParentValidatorStatus: 'VALID'
    // }
];
