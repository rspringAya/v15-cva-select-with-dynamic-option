import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/material.module';
import { AppComponent } from './app.component';
import { DisableUntilReadyModule } from './disable-until-ready/disabled-until-ready.module';
import { MultiSelectAutoComplete } from './multi-select-auto-complete/multi-select-auto-complete';
import { SelectAutoCompleteExamplesComponent } from './select-auto-complete-examples/select-auto-complete-examples.component';
import { SelectAutoComplete } from './select-auto-complete/select-auto-complete';

@NgModule({
    declarations: [
        SelectAutoComplete,
        MultiSelectAutoComplete,
        AppComponent,
        SelectAutoCompleteExamplesComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        MaterialModule,
        HttpClientModule,
        ReactiveFormsModule,
        CommonModule,
        DisableUntilReadyModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
