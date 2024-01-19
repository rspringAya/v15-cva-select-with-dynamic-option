import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
    selector: 'tutorial-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    toppings = new FormControl([2, 5, 1]);

    options = of([
        { id: 0, name: 'Extra cheese' },
        { id: 1, name: 'Mushroom' },
        { id: 2, name: 'Onion' },
        { id: 3, name: 'Pepperoni' },
        { id: 4, name: 'Sausage' },
        { id: 5, name: 'Tomato' }
    ]).pipe(delay(1000));
}
