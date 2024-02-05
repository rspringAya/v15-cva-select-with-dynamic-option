import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialExampleModule } from 'src/material.module';
import { AppComponent } from './app.component';
import { MultiSelectAutoComplete } from './multi-select-auto-complete/multi-select-auto-complete';
import { SelectAutoCompleteExamplesComponent } from './select-auto-complete-examples/select-auto-complete-examples.component';
import { SelectAutoComplete } from './select-auto-complete/select-auto-complete';
import { DisableUntilReadyModule } from './disable-until-ready/disabled-until-ready.module';

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
        MaterialExampleModule,
        HttpClientModule,
        ReactiveFormsModule,
        CommonModule,
        DisableUntilReadyModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
