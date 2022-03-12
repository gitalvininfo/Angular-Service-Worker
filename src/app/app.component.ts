import { HttpClient } from '@angular/common/http';
import { ApplicationRef, Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'pwa';
  todos: any[] = [];

  constructor(private _http: HttpClient, private _update: SwUpdate, private _appRef: ApplicationRef) {
    this.updateClient();
    this.checkUpdate();
  }

  ngOnInit(): void {
    const url = 'https://jsonplaceholder.typicode.com/todos';

    this._http.get(url).subscribe((res: any) => {
      console.log(res);
      this.todos = res;
    });
  }

  updateClient(): void {
    console.warn(this._update.isEnabled);
    if (!this._update.isEnabled) {
      console.log('Not Enabled!');
      return;
    }

    /* check for changes in client 👀 */
    this._update.available.subscribe((event) => {
      console.log(
        `AVAILABLE - current`,
        event.current,
        `available`,
        event.available
      );

      if (confirm('update available for the app')) {
        this._update.activateUpdate().then(() => location.reload());
      }
    });

    /* check for current 👀 */
    /* triggers after sw updated, this will be called 😱 */
    this._update.activated.subscribe((event) => {
      console.log(
        `ACTIVATED - current`,
        event.previous,
        `available`,
        event.current
      );
    });
  }

  /* this will trigger available updates for confirmation 😮*/
  checkUpdate(): void {
      this._appRef.isStable.subscribe((isStable) => {
        if(isStable) {
          const timeInterval = interval(20000);

          timeInterval.subscribe(() => {
            this._update.checkForUpdate().then(() => console.log('checked'));
            console.log('update checked');
          })
        }
      }) 
  }
}
