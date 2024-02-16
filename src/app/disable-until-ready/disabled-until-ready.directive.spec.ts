import {
    FormGroup,
    Validators,
    FormControl,
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import { SpectatorDirective, createDirectiveFactory } from '@ngneat/spectator';
import { fakeAsync, tick } from '@angular/core/testing';
import { DisableUntilReadyDirective } from './disabled-until-ready.directive';

describe('DisableUntilReadyDirective', () => {
    let spectator: SpectatorDirective<DisableUntilReadyDirective>;
    const createDirective = createDirectiveFactory({
            directive: DisableUntilReadyDirective,
            imports: [FormsModule, ReactiveFormsModule]
        }),
        validFormValues = {
            name: 'Jane',
            age: 18,
            email: 'jane@nowhere.com'
        },
        invalidFormValues = {
            name: 'Jane',
            age: 10,
            email: 'jane@nowhere.com'
        };

    let form: FormGroup<{
        name: FormControl<string | null>;
        email: FormControl<string | null>;
        age: FormControl<number>;
    }>;

    beforeEach(() => {
        form = new FormGroup({
            name: new FormControl('', Validators.required),
            email: new FormControl('', Validators.email),
            age: new FormControl(0, {
                validators: [Validators.min(18), Validators.required],
                nonNullable: true
            })
        });
    });

    const initialize = (enableOnPristine: boolean) => {
        spectator = createDirective(
            `<form [formGroup]="form">
                <input type="text" formControlName="name" />
                <input type="number" formControlName="age" />
                <input type="email" formControlName="email" />
                <button
                    type="submit"
                    [locumsDisableUntilReady]="form"
                    [enableOnPristine]="enableOnPristine"
                >
                    Submit
                </button>
            </form>`,
            {
                hostProps: {
                    form,
                    enableOnPristine
                }
            }
        );
    };

    describe('with enableOnPristine false', () => {
        const enableOnPristine = false;

        beforeEach(() => {
            initialize(enableOnPristine);
        });

        it('should start disabled when pristine, even if the form is valid', fakeAsync(() => {
            // Arrange
            const button: HTMLButtonElement | null = spectator.query('button');

            form.patchValue(validFormValues);

            // Act
            form.updateValueAndValidity();
            tick(1);
            spectator.detectChanges();

            // Assert

            expect(button).toHaveAttribute('disabled');
        }));

        it('should set the button disabled if form was dirty but intentionally calling markAsPristine', fakeAsync(() => {
            // Arrange
            const button: HTMLButtonElement | null = spectator.query('button');

            form.patchValue({
                name: 'Jane',
                age: 18,
                email: 'jane@nowhere.com'
            });

            form.updateValueAndValidity();
            spectator.detectChanges();

            expect(button).toHaveAttribute('disabled');

            // Act

            spectator.focus('input[type="text"]');
            spectator.typeInElement('John', 'input[type="text"]');

            form.markAsDirty();
            form.markAllAsTouched();
            form.updateValueAndValidity();
            tick(1);
            spectator.detectChanges();

            expect(button).not.toHaveAttribute('disabled');

            form.markAsUntouched();
            form.markAsPristine();
            form.updateValueAndValidity();
            tick(1);
            spectator.detectChanges();

            // Assert
            expect(button).toHaveAttribute('disabled');
        }));

        it('should remove disabled from button as editing to make all fields valid', fakeAsync(() => {
            // Arrange
            const button: HTMLButtonElement | null = spectator.query('button');

            form.patchValue({
                age: 18,
                email: 'jane@nowhere.com'
            });

            expect(button).toHaveAttribute('disabled');

            // Act
            form.patchValue({
                name: 'Jane'
            });
            form.markAllAsTouched();

            form.controls.name.markAsDirty();
            form.updateValueAndValidity();
            tick(1);
            spectator.detectChanges();
            // Assert

            expect(button).not.toHaveAttribute('disabled');
        }));

        it('should keep the button disabled when touched and no changes', fakeAsync(() => {
            // Arrange
            const button: HTMLButtonElement | null = spectator.query('button');

            form.patchValue({
                name: 'Jane',
                age: 18,
                email: 'jane@nowhere.com'
            });

            expect(button).toHaveAttribute('disabled');
            spectator.focus('input[type="text"]');

            // Act
            form.updateValueAndValidity();
            tick(1);
            spectator.detectChanges();
            // Assert

            expect(button).toHaveAttribute('disabled');
        }));
    });

    describe('with enableOnPristine true', () => {
        const enableOnPristine = true;

        beforeEach(() => {
            initialize(enableOnPristine);
        });

        it('should start enabled when pristine, if enableOnPristine is true', fakeAsync(() => {
            // Arrange
            const button: HTMLButtonElement | null = spectator.query('button');

            form.patchValue({
                name: 'Jane',
                age: 18,
                email: 'jane@nowhere.com'
            });

            // Act
            form.updateValueAndValidity();
            tick(1);
            spectator.detectChanges();

            // Assert

            expect(button).not.toBeDisabled();
        }));

        it('should start disabled when pristine and enableOnPristine is true, but form is invalid', fakeAsync(() => {
            // Arrange
            const button: HTMLButtonElement | null = spectator.query('button');

            form.patchValue(invalidFormValues);

            // Act
            form.updateValueAndValidity();
            tick(10);
            spectator.detectChanges();

            // Assert

            expect(button).toBeDisabled();
        }));
    });
});
