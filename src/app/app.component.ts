import { Component } from '@angular/core';
import {
  take, map, combineAll, catchError, mergeMap, retry,
  tap, retryWhen, delayWhen, publish
} from 'rxjs/operators';
import { interval, of, from, throwError, timer } from 'rxjs';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  name = 'Angular';
  constructor() {
    // of
    //emits any number of provided values in sequence
    const source = of(1, 2, 3, 4, 5);
    //output: 1,2,3,4,5
    const subscribe = source.subscribe(val => console.log(val));

    // from
    //emit array as a sequence of values
    const arraySource2 = from([1, 2, 3, 4, 5]);
    //output: 1,2,3,4,5
    const subscribe2 = arraySource2.subscribe(val => console.log(val));

    // Catching error from observable
    //emit error
    const source2 = throwError('This is an error!');
    //gracefully handle error, returning observable with error message
    const example = source2.pipe(catchError(val => of(`I caught: ${val}`)));
    //output: 'I caught: This is an error'
    const subscribe3 = example.subscribe(val => console.log(val));

    // retry
    //emit value every 1s
    const source3 = interval(1000);
    const example2 = source3.pipe(
      mergeMap(val => {
        //throw error for demonstration
        if (val > 5) {
          return throwError('Error!');
        }
        return of(val);
      }),
      //retry 2 times on error
      retry(2)
    );

    const subscribe4 = example2.subscribe({
      next: val => console.log(val),
      error: val => console.log(`${val}: Retried 2 times then quit!`)
    });

    // retryWhen
    //emit value every 1s
    const source4 = interval(1000);
    const example3 = source4.pipe(
      map(val => {
        if (val > 5) {
          //error will be picked up by retryWhen
          throw val;
        }
        return val;
      }),
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(val => console.log(`Value ${val} was too high!`)),
          //restart in 6 seconds
          delayWhen(val => timer(val * 1000))
        )
      )
    );
    const subscribe5 = example3.subscribe(val => console.log(val));

    // publish
    //emit value every 1 second
    const source5 = interval(1000);
    const example4 = source.pipe(
      //side effects will be executed once
      tap(_ => console.log('Do Something!')),
      //do nothing until connect() is called
      publish()
    );

    const subscribe6 = example4.subscribe(val =>
      console.log(`Subscriber One: ${val}`)
    );
    const subscribe6Two = example4.subscribe(val =>
      console.log(`Subscriber Two: ${val}`)
    );

    //call connect after 5 seconds, causing source to begin emitting items
    setTimeout(() => {
      example4.connect();
    }, 5000);
  }
}
