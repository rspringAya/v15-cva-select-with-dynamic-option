import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { delay, of } from 'rxjs';
import { initialValueAndValidatorTestScenarios, invalidInitialValueAndValidatorTestScenarios } from '../select-auto-complete/test-scenarios';

@Component({
    selector: 'tutor-select-auto-complete-examples',
    templateUrl: './select-auto-complete-examples.component.html',
    styleUrls: ['./select-auto-complete-examples.component.scss']
})
export class SelectAutoCompleteExamplesComponent {
    listItemsWithZeroPayload = [
        { id: 0, name: 'test 0' },
        { id: 1, name: 'test 1' },
        { id: 2, name: 'test 2' },
        { id: 3, name: 'test 3' },
        { id: 4, name: 'foo' }
    ];

    listItemsWithoutZeroPayload = [
        { id: 1, name: 'test 1' },
        { id: 2, name: 'test 2' },
        { id: 3, name: 'test 3' },
        { id: 4, name: 'foo' }
    ];

    scenarios = [...initialValueAndValidatorTestScenarios, ...invalidInitialValueAndValidatorTestScenarios];
    scenariosWithControls = this.scenarios.map((s) => {
        const listItems$ =
            s.validatorName === 'AyaValidators.minAsRequired(1)'
                ? of(this.listItemsWithoutZeroPayload)
                : of(this.listItemsWithZeroPayload);

        return {
            c: new FormControl(s.initialValue, s.validator),
            s,
            listItems$
        };
    });

    scenariosWithControlsAndDelayedListItems = this.scenarios.map((s) => {
        const listItems$ =
            s.validatorName === 'AyaValidators.minAsRequired(1)'
                ? of(this.listItemsWithoutZeroPayload).pipe(delay(2000))
                : of(this.listItemsWithZeroPayload).pipe(delay(2000));

        return {
            c: new FormControl(s.initialValue, s.validator),
            s,
            listItems$
        };
    });
}
