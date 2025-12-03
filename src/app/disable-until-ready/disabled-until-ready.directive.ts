import {
    Directive,
    Input,
    OnInit,
    HostBinding,
    ChangeDetectorRef
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { startWith } from 'rxjs/operators';
import { onAllFormActivity } from '../forms';

/**
 * Disables the host element until the form group is in
 * acceptable state - pristine or (dirty and valid).
 *
 * _Important_: If the form is being preloaded with existing information,
 * be sure to call .markAsPristine() on the form group after.
 */
@UntilDestroy()
@Directive({
    selector: '[locumsDisableUntilReady]'
})
export class DisableUntilReadyDirective implements OnInit {
    // Required inputs are coming!
    @Input('locumsDisableUntilReady')
    formGroup: AbstractControl | AbstractControl[] | undefined;

    @Input() enableOnPristine = false;
    @Input() overrideDisabledState?: boolean = undefined;

    @HostBinding('disabled')
    private _disabled = true;

    constructor(private readonly chgRef: ChangeDetectorRef) {}

    @HostBinding('class.mat-button-disabled')
    get disabledClass() {
        return this._disabled;
    }

    ngOnInit() {
        if (this.formGroup) {
            // This is not for a FormArray, but for a literal array of FormGroups
            if (Array.isArray(this.formGroup)) {
                this.formGroup.forEach((frmGrp) => {
                    onAllFormActivity(frmGrp, {
                        enableOnPristine: this.enableOnPristine
                    })
                        .pipe(
                            startWith({
                                disabled: !(
                                    this.enableOnPristine &&
                                    frmGrp.pristine &&
                                    frmGrp.valid
                                )
                            }),
                            untilDestroyed(this)
                        )
                        .subscribe(({ disabled }) => {
                            this._disabled =
                                this.overrideDisabledState || disabled;
                        });
                });
                return;
            }
            onAllFormActivity(this.formGroup, {
                enableOnPristine: this.enableOnPristine
            })
                .pipe(
                    startWith({
                        disabled: !(
                            this.enableOnPristine &&
                            this.formGroup.pristine &&
                            this.formGroup.valid
                        )
                    }),
                    untilDestroyed(this)
                )
                .subscribe(({ disabled }) => {
                    this._disabled = this.overrideDisabledState || disabled;
                    this.chgRef.markForCheck();
                });
        }
    }
}
