import { NgModule } from '@angular/core';
import { DisableUntilReadyDirective } from './disabled-until-ready.directive';

@NgModule({
    declarations: [DisableUntilReadyDirective],
    exports: [DisableUntilReadyDirective]
})
export class DisableUntilReadyModule {}
