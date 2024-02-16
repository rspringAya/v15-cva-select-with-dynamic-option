import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import {
    ControlContainer,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    ValidatorFn
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SpectatorHost, createHostFactory } from '@ngneat/spectator';
import { Observable, ReplaySubject } from 'rxjs';
import { ListItem } from '../list-item.models';
import { SelectAutoComplete } from './select-auto-complete';
import {
    initialValueAndValidatorTestScenarios,
    invalidInitialValueAndValidatorTestScenarios
} from './test-scenarios';

describe('SelectAutoComplete', () => {
    /** The initial value used when defining the parent form */
    let parentFormInitialValue: any,
        /** The validator assigned to the parent form (this is where the parent form config
         * can define whether the CVA should be required)
         */
        parentFormValidators: ValidatorFn | null;

    /**
     * A default list of ListItem to later feed to the parent ReplaySubject
     */
    const listItemsWithZeroPayloadForHostStore = [
        { id: 0, name: 'test 0' },
        { id: 1, name: 'test 1' },
        { id: 2, name: 'test 2' },
        { id: 3, name: 'test 3' },
        { id: 4, name: 'foo' }
    ];

    const listItemsWithoutZeroPayloadForHostStore = [
        { id: 1, name: 'test 1' },
        { id: 2, name: 'test 2' },
        { id: 3, name: 'test 3' },
        { id: 4, name: 'foo' }
    ];

    /**
     * `TestHostComponent` acts as a test host for the 'locums-select-auto-complete' component.
     * This component is primarily used in testing environments to simulate interaction with
     * the 'locums-select-auto-complete' component.
     *
     * It contains a store (`fakeHostComponentStoreForListItems$`) for managing `ListItem` objects,
     * which can be used to emulate dynamic data input for testing purposes.
     *
     * @Component Decorator that marks a class as an Angular component and provides configuration
     * metadata that determines how the component should be processed, instantiated, and used at runtime.
     */
    @Component({
        template: ``,
        selector: 'test-host-component-for-locums-select-auto-complete'
    })
    class TestHostComponent {
        /**
         * A ReplaySubject that stores a list of ListItem objects. It's set to replay the last value (1) to late a subscription.
         * This is useful for simulating a dynamic data from an asynchronous source for the auto-complete component.
         */
        fakeHostComponentStoreForListItems$ = new ReplaySubject<ListItem[]>(1);

        /**
         * An Observable stream of `ListItem[]`. It is derived from `fakeHostComponentStoreForListItems$`.
         * This can be used to provide a dynamic list of items to the auto-complete component in tests.
         */
        listItems$: Observable<ListItem[]> =
            this.fakeHostComponentStoreForListItems$.asObservable();

        /**
         * A numeric value representing the count of results (e.g., items in the auto-complete).
         */
        resultsCount = 0;

        changesCount = 0;
        /**
         * A flag to indicate whether the component is in a loading state.
         */
        isLoading = false;

        /**
         * An instance of `FormControl`, used to control a form input in the Angular reactive forms.
         */
        control: FormControl<any>;

        /**
         * The constructor initializes the `control` property with an initial value and validators.
         * These might be related to the parent form's requirements.
         */
        constructor() {
            this.control = new FormControl(
                parentFormInitialValue,
                parentFormValidators
            );
            this.control.valueChanges.subscribe((v) => {
                this.changesCount++;
            });
        }
    }

    let spectator: SpectatorHost<SelectAutoComplete, TestHostComponent>;

    /**
     * Be sure to call `tick(100)` to flush out the `debounceTime(100)` in valueChanges
     * and `spectator.detectChanges()` somewhere after this.
     *
     * The presence of debounceTime may change, depending on the solution in the SelectAutoComplete Component.
     *
     * This will require wrapping the `it()` in `fakeAsync`.
     *
     * @param value
     *      Emitted {@link ListItem} from the parent component to {@link SelectAutoComplete} via input with an async pipe.
     */
    const setParentControlValue_CallTickAndDetectChangesAfterMe = (
        value: number
    ) => {
        spectator.hostComponent.control.setValue(value);
    };

    /**
     * Be sure to call `tick(1)` and `spectator.detectChanges()` somewhere after this.
     * This will require wrapping the `it()` in `fakeAsync`.
     *
     * @param value
     *      Emitted {@link ListItem} from the parent component to {@link SelectAutoComplete} via input with an async pipe.
     */
    const emitNewListItemsFromParent_CallTickAndDetectChangesAfterMe = (
        value: ListItem[]
    ) => {
        spectator.hostComponent.fakeHostComponentStoreForListItems$.next(value);
    };

    /**
     * Creates a testing environment for `SelectAutoComplete` using the `createHostFactory` method.
     * This setup is used for isolated unit tests of the `SelectAutoComplete` within a controlled environment.
     *
     * @const createComponent A factory function to instantiate the test host component with the required dependencies.
     *
     * The configuration object passed to `createHostFactory` includes:
     * - `component`: The component under test, `SelectAutoComplete`.
     * - `host`: The `TestHostComponent` which will act as a testing host for the component.
     * - `declarations`: Components declared for this test environment.
     *    Includes both `SelectAutoComplete` and `TestHostComponent`.
     * - `providers`: Dependency injection providers for the testing environment.
     *    It includes a mock for `LDFeatureManager` and uses `TestHostComponent` as a mock for `ControlContainer`.
     * - `imports`: Modules imported for the testing environment.
     *    Includes modules like `NoopAnimationsModule`, `FormsModule`, `ReactiveFormsModule`, and `MatAutocompleteModule`
     *    which are necessary for testing Angular components with forms and material design features.
     * - `detectChanges`: A flag set to `false` to manually handle change detection in tests.
     * - `schemas`: An array of schemas, in this case, containing `NO_ERRORS_SCHEMA`
     *    which allows for a more lenient handling of unrecognized elements and attributes in templates.
     */
    const createComponent = createHostFactory({
        component: SelectAutoComplete,
        host: TestHostComponent,
        declarations: [SelectAutoComplete, TestHostComponent],
        providers: [{ provide: ControlContainer, useClass: TestHostComponent }],
        imports: [
            NoopAnimationsModule,
            FormsModule,
            ReactiveFormsModule,
            MatAutocompleteModule
        ],
        detectChanges: false,
        schemas: [NO_ERRORS_SCHEMA]
    });

    // In a constant to make collapsable. Change this if you can get it to collapse another way.

    initialValueAndValidatorTestScenarios.forEach(
        ({
            initialValue,
            validator,
            validatorName,
            validatorStatus,
            errors,
            expectedInternalValue,
            expectedParentValue,
            expectedParentValidatorStatus
        }) => {
            const strInitialValue = JSON.stringify(initialValue);
            describe(`with list items immediately available, initial value set to (${strInitialValue}), 
                        and validator '${validatorName}'`, () => {
                const strInternalValue = JSON.stringify(expectedInternalValue);
                const strExpectedParentValue =
                    JSON.stringify(expectedParentValue);
                beforeEach(() => {
                    parentFormInitialValue = initialValue;
                    parentFormValidators = validator;

                    spectator = createComponent(`<aya-select-auto-complete
                                                
                                                [listItems]="listItems$ | async"
                                                [isLoading]="isLoading"
                                                [formControl]="control"
                                                label="Test Autocomplete"
                                            >
                                            </aya-select-auto-complete>`);

                    emitNewListItemsFromParent_CallTickAndDetectChangesAfterMe(
                        validatorName === 'AyaValidators.minAsRequired(1)'
                            ? listItemsWithoutZeroPayloadForHostStore
                            : listItemsWithZeroPayloadForHostStore
                    );
                });

                it(`should initialize with value (${strInternalValue}), but not emit to parent should remain as 
                        (${strExpectedParentValue}).`, fakeAsync(() => {
                    //Set parent list items
                    tick(1);
                    spectator.detectChanges();

                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    expect(spectator.component.inputControl.value).toEqual(
                        expectedInternalValue
                    );

                    expect(spectator.hostComponent.control.value).toEqual(
                        expectedParentValue
                    );

                    expect(spectator.component.inputControl.errors).toEqual(
                        errors
                    );

                    expect(spectator.component.inputControl.status).toEqual(
                        validatorStatus
                    );

                    expect(
                        spectator.hostComponent.control.untouched
                    ).toBeTrue();

                    expect(spectator.hostComponent.control.pristine).toBeTrue();

                    expect(spectator.hostComponent.control.status).toEqual(
                        expectedParentValidatorStatus
                    );

                    expect(spectator.hostComponent.changesCount).toBe(0);

                    spectator.component.inputControl.setValue(
                        listItemsWithZeroPayloadForHostStore[2].name
                    );

                    tick(100);
                    spectator.detectChanges();

                    expect(spectator.hostComponent.changesCount).toBe(1);
                }));

                it('to be invalid', fakeAsync(() => {
                    tick(1);
                    spectator.detectChanges();

                    tick(100);
                    spectator.detectChanges();

                    expect(spectator.component.inputControl.value).toEqual(
                        expectedInternalValue
                    );

                    expect(spectator.hostComponent.control.value).toEqual(
                        expectedParentValue
                    );

                    expect(spectator.component.inputControl.errors).toEqual(
                        errors
                    );

                    expect(spectator.component.inputControl.status).toEqual(
                        validatorStatus
                    );
                }));
            });
        }
    );

    initialValueAndValidatorTestScenarios.forEach(
        ({
            initialValue,
            validator,
            validatorName,
            validatorStatus,
            errors,
            expectedInternalValue,
            expectedParentValue,
            expectedParentValidatorStatus
        }) => {
            const strInitialValue = JSON.stringify(initialValue);
            describe(`with list items asynchronously delayed by 100ms, initial value set to (${strInitialValue}), 
                        and validator '${validatorName}'`, () => {
                const strInternalValue = JSON.stringify(expectedInternalValue);
                let listItems: ListItem[];
                const strExpectedParentValue =
                    JSON.stringify(expectedParentValue);
                beforeEach(() => {
                    parentFormInitialValue = initialValue;
                    parentFormValidators = validator;

                    spectator = createComponent(`<aya-select-auto-complete
                                                
                                                [listItems]="listItems$ | async"
                                                [isLoading]="isLoading"
                                                [formControl]="control"
                                                label="Test Autocomplete"
                                            >
                                            </aya-select-auto-complete>`);
                    listItems =
                        validatorName === 'AyaValidators.minAsRequired(1)'
                            ? listItemsWithoutZeroPayloadForHostStore
                            : listItemsWithZeroPayloadForHostStore;
                });

                it(`should initialize with value (${strInternalValue}), but not emit to parent should remain as 
                        (${strExpectedParentValue}).`, fakeAsync(() => {
                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    //Set parent list items
                    emitNewListItemsFromParent_CallTickAndDetectChangesAfterMe(
                        listItems
                    );
                    tick(1);
                    spectator.detectChanges();

                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    expect(spectator.component.inputControl.value).toEqual(
                        expectedInternalValue
                    );

                    expect(spectator.hostComponent.control.value).toEqual(
                        expectedParentValue
                    );

                    expect(spectator.component.inputControl.errors).toEqual(
                        errors
                    );

                    expect(spectator.component.inputControl.status).toEqual(
                        validatorStatus
                    );

                    expect(
                        spectator.hostComponent.control.untouched
                    ).toBeTrue();

                    expect(spectator.hostComponent.control.pristine).toBeTrue();

                    expect(spectator.hostComponent.control.status).toEqual(
                        expectedParentValidatorStatus
                    );

                    expect(spectator.hostComponent.changesCount).toBe(0);
                }));

                it(`should initialize with value (${strInternalValue}), and emit changes to parent.`, fakeAsync(() => {
                    // Arrange

                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    //Set parent list items
                    emitNewListItemsFromParent_CallTickAndDetectChangesAfterMe(
                        listItems
                    );
                    tick(1);
                    spectator.detectChanges();

                    // For debounceTime(100) in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    expect(spectator.component.inputControl.value).toEqual(
                        expectedInternalValue
                    );

                    expect(spectator.hostComponent.control.value).toEqual(
                        expectedParentValue
                    );

                    // Act
                    spectator.component.inputControl.setValue(
                        listItemsWithZeroPayloadForHostStore[2].name
                    );

                    // For debounceTime(100) in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    // Assert
                    expect(spectator.hostComponent.changesCount).toBe(1);
                    expect(spectator.hostComponent.control.dirty).toBeTrue();
                    // Note this test will not cover touched state, because we are
                    // not actually touching the control. Only changing the value.
                }));

                it(`should initialize with value (${strInternalValue}), and onBlur should mark parent as touched.`, fakeAsync(() => {
                    // Arrange

                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    //Set parent list items
                    emitNewListItemsFromParent_CallTickAndDetectChangesAfterMe(
                        listItems
                    );
                    tick(1);
                    spectator.detectChanges();

                    // For debounceTime(100) in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    expect(spectator.component.inputControl.value).toEqual(
                        expectedInternalValue
                    );

                    expect(spectator.hostComponent.control.value).toEqual(
                        expectedParentValue
                    );

                    // Act
                    spectator.component.onBlur();

                    // onBlur triggers an updateValueAndValidity
                    // For debounceTime(100) in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    // Assert
                    expect(spectator.hostComponent.changesCount).toBe(1);
                    expect(spectator.hostComponent.control.touched).toBeTrue();
                }));

                it(`to be ${validatorStatus}`, fakeAsync(() => {
                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    //Set parent list items
                    emitNewListItemsFromParent_CallTickAndDetectChangesAfterMe(
                        listItems
                    );
                    tick(1);
                    spectator.detectChanges();

                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();
                    expect(spectator.component.inputControl.value).toEqual(
                        expectedInternalValue
                    );

                    expect(spectator.hostComponent.control.value).toEqual(
                        expectedParentValue
                    );

                    expect(spectator.component.inputControl.errors).toEqual(
                        errors
                    );

                    expect(spectator.component.inputControl.status).toEqual(
                        validatorStatus
                    );
                }));
            });
        }
    );

    invalidInitialValueAndValidatorTestScenarios.forEach(
        ({
            initialValue,
            validator,
            validatorName,
            validatorStatus,
            errors,
            expectedInternalValue,
            expectedParentValue,
            expectedParentValidatorStatus
        }) => {
            const strInitialValue = JSON.stringify(initialValue);
            describe(`with list items immediately available, initial value set to (${strInitialValue}), 
                        and validator '${validatorName}'`, () => {
                const strInternalValue = JSON.stringify(expectedInternalValue);
                const strExpectedParentValue =
                    JSON.stringify(expectedParentValue);
                beforeEach(() => {
                    parentFormInitialValue = initialValue;
                    parentFormValidators = validator;

                    spectator = createComponent(`<aya-select-auto-complete
                                                
                                                [listItems]="listItems$ | async"
                                                [isLoading]="isLoading"
                                                [formControl]="control"
                                                label="Test Autocomplete"
                                            >
                                            </aya-select-auto-complete>`);

                    emitNewListItemsFromParent_CallTickAndDetectChangesAfterMe(
                        validatorName === 'AyaValidators.minAsRequired(1)'
                            ? listItemsWithoutZeroPayloadForHostStore
                            : listItemsWithZeroPayloadForHostStore
                    );
                });

                it(`should initialize with value (${strInternalValue}), but not emit to parent should remain as 
                        (${strExpectedParentValue}).`, fakeAsync(() => {
                    //Set parent list items
                    tick(1);
                    spectator.detectChanges();

                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    expect(spectator.component.inputControl.value).toEqual(
                        expectedInternalValue
                    );

                    expect(spectator.hostComponent.control.value).toEqual(
                        expectedParentValue
                    );

                    expect(spectator.component.inputControl.errors).toEqual(
                        errors
                    );

                    expect(spectator.component.inputControl.status).toEqual(
                        validatorStatus
                    );

                    expect(
                        spectator.hostComponent.control.untouched
                    ).toBeTrue();

                    expect(
                        spectator.hostComponent.control.pristine
                    ).toBeFalse();

                    expect(spectator.hostComponent.control.status).toEqual(
                        expectedParentValidatorStatus
                    );

                    expect(spectator.hostComponent.changesCount).toBe(1);

                    spectator.component.inputControl.setValue(
                        listItemsWithZeroPayloadForHostStore[2].name
                    );

                    tick(100);
                    spectator.detectChanges();

                    expect(spectator.hostComponent.changesCount).toBe(2);
                }));

                it('to be invalid', fakeAsync(() => {
                    tick(1);
                    spectator.detectChanges();
                    // Second tick for the delay for register on changes to occur
                    tick(1);
                    spectator.detectChanges();

                    tick(100);
                    spectator.detectChanges();

                    expect(spectator.component.inputControl.value).toEqual(
                        expectedInternalValue
                    );

                    expect(spectator.hostComponent.control.value).toEqual(
                        expectedParentValue
                    );

                    expect(spectator.component.inputControl.errors).toEqual(
                        errors
                    );

                    expect(spectator.component.inputControl.status).toEqual(
                        validatorStatus
                    );
                }));
            });
        }
    );

    /*
     * Not duplicates
     * These tests are for an initial value that is not in the list items that are set to the control
     */
    invalidInitialValueAndValidatorTestScenarios.forEach(
        ({
            initialValue,
            validator,
            validatorName,
            validatorStatus,
            errors,
            expectedInternalValue,
            expectedParentValue,
            expectedParentValidatorStatus
        }) => {
            const strInitialValue = JSON.stringify(initialValue);
            describe(`with list items asynchronously delayed by 100ms, initial value set to (${strInitialValue}), 
                        and validator '${validatorName}'`, () => {
                const strInternalValue = JSON.stringify(expectedInternalValue);
                let listItems: ListItem[];
                const strExpectedParentValue =
                    JSON.stringify(expectedParentValue);
                beforeEach(() => {
                    parentFormInitialValue = initialValue;
                    parentFormValidators = validator;

                    spectator = createComponent(`<aya-select-auto-complete
                                                
                                                [listItems]="listItems$ | async"
                                                [isLoading]="isLoading"
                                                [formControl]="control"
                                                label="Test Autocomplete"
                                            >
                                            </aya-select-auto-complete>`);
                    listItems =
                        validatorName === 'AyaValidators.minAsRequired(1)'
                            ? listItemsWithoutZeroPayloadForHostStore
                            : listItemsWithZeroPayloadForHostStore;
                });

                it(`should initialize with value (${strInternalValue}), but not emit to parent should remain as 
                        (${strExpectedParentValue}).`, fakeAsync(() => {
                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    //Set parent list items
                    emitNewListItemsFromParent_CallTickAndDetectChangesAfterMe(
                        listItems
                    );
                    tick(1);
                    spectator.detectChanges();

                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    expect(spectator.component.inputControl.value).toEqual(
                        expectedInternalValue
                    );

                    expect(spectator.hostComponent.control.value).toEqual(
                        expectedParentValue
                    );

                    expect(spectator.component.inputControl.errors).toEqual(
                        errors
                    );

                    expect(spectator.component.inputControl.status).toEqual(
                        validatorStatus
                    );

                    expect(
                        spectator.hostComponent.control.untouched
                    ).toBeTrue();

                    expect(
                        spectator.hostComponent.control.pristine
                    ).toBeFalse();

                    expect(spectator.hostComponent.control.status).toEqual(
                        expectedParentValidatorStatus
                    );

                    expect(spectator.hostComponent.changesCount).toBe(1);


                    tick(100);
                    spectator.detectChanges();
                }));

                it(`to be ${validatorStatus}`, fakeAsync(() => {
                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();

                    //Set parent list items
                    emitNewListItemsFromParent_CallTickAndDetectChangesAfterMe(
                        listItems
                    );
                    tick(1);
                    spectator.detectChanges();

                    // Second tick for the delay for register on changes to occur
                    tick(1);
                    spectator.detectChanges();

                    // For debounce in valueChanges
                    tick(100);
                    spectator.detectChanges();
                    expect(spectator.component.inputControl.value).toEqual(
                        expectedInternalValue
                    );

                    expect(spectator.hostComponent.control.value).toEqual(
                        expectedParentValue
                    );

                    expect(spectator.component.inputControl.errors).toEqual(
                        errors
                    );

                    expect(spectator.component.inputControl.status).toEqual(
                        validatorStatus
                    );
                }));
            });
        }
    );
});
