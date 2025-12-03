import { FormControl } from '@angular/forms';
import { AyaValidators } from '.';

describe('minAsRequired', () => {
    it('should not error on an empty string', () => {
        expect(AyaValidators.minAsRequired(2)(new FormControl(''))).toBeNull();
    });

    it('should error on null', () => {
        expect(
            AyaValidators.minAsRequired(2)(new FormControl(null))
        ).toEqual({
            required: true,
            min: {
                min: 2,
                actual: null
            }
        });
    });

    /** FormControl natively converts `undefined` to `null` */
    it('should error on undefined', () => {
        expect(
            AyaValidators.minAsRequired(2)(new FormControl(undefined))
        ).toEqual({
            required: true,
            min: {
                min: 2,
                actual: null
            }
        });
    });

    it('should return null if NaN after parsing', () => {
        expect(AyaValidators.minAsRequired(2)(new FormControl('a'))).toBeNull();
    });

    it('should return a validation error on small values from objects with id', () => {
        expect(AyaValidators.minAsRequired(0)(new FormControl({id: -1, name: ''}))).toEqual({
            required: true,
            min: {
                min: 0,
                actual: -1
            }
        });
    });

    // it('should return a validation error on null', () => {
    //     expect(AyaValidators.minAsRequired(0)(new FormControl({id: 1, name: ''}))).toEqual({
    //         required: true,
    //         min: {
    //             min: 0,
    //             actual: null
    //         }
    //     });
    // });

    it('should return a validation error on small values', () => {
        expect(AyaValidators.minAsRequired(2)(new FormControl(1))).toEqual({
            required: true,
            min: {
                min: 2,
                actual: 1
            }
        });
    });

    it('should return a validation error on small values converted from strings', () => {
        expect(AyaValidators.minAsRequired(2)(new FormControl('1'))).toEqual({
            required: true,
            min: {
                min: 2,
                actual: '1'
            }
        });
    });

    it('should not error on small float number validation', () => {
        expect(
            AyaValidators.minAsRequired(1.2)(new FormControl(1.25))
        ).toBeNull();
    });

    it('should not error on equal float values', () => {
        expect(
            AyaValidators.minAsRequired(1.25)(new FormControl(1.25))
        ).toBeNull();
    });

    it('should return a validation error on big values', () => {
        expect(AyaValidators.minAsRequired(1.25)(new FormControl(1.2))).toEqual(
            {
                required: true,
                min: {
                    min: 1.25,
                    actual: 1.2
                }
            }
        );
    });

    it('should not error on big values', () => {
        expect(AyaValidators.minAsRequired(2)(new FormControl(3))).toBeNull();
    });

    it('should not error on equal values', () => {
        expect(AyaValidators.minAsRequired(2)(new FormControl(2))).toBeNull();
    });

    it('should not error on equal values when value is string', () => {
        expect(AyaValidators.minAsRequired(2)(new FormControl('2'))).toBeNull();
    });

    it('should validate as expected when min value is a string', () => {
        expect(
            AyaValidators.minAsRequired('2' as any)(new FormControl(1))
        ).toEqual({
            required: true,
            min: {
                min: '2',
                actual: 1
            }
        });
    });

    it('should return null if min value is undefined', () => {
        expect(
            AyaValidators.minAsRequired(undefined as any)(new FormControl(3))
        ).toBeNull();
    });

    it('should return null if min value is null', () => {
        expect(
            AyaValidators.minAsRequired(null as any)(new FormControl(3))
        ).toBeNull();
    });
});
