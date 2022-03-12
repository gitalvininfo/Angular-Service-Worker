import { HttpClient } from '@angular/common/http';
import { ApplicationRef, Component, OnInit } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';
import { IndexedDBService } from './services/indexed-db.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'pwa';
  todos: any[] = [];
  readonly publicKey =
    'BLNhRPmytqEzQk7xgfPu90wycmiZyUF1hvWkRQz7CyXt_P2zqPI72CDyIrRPcJlyMNj8PZdbYaNACUgOEHSh-9g';

  constructor(
    private _http: HttpClient,
    private _update: SwUpdate,
    private _appRef: ApplicationRef,
    private swPush: SwPush,
    private indexDB: IndexedDBService
  ) {
    this.updateClient();
    this.checkUpdate();
  }

  ngOnInit(): void {
    this.pushSubscription();

    this.swPush.messages.subscribe((message) => {
      console.log(message);
    });

    /* DO NOT USE HTTP CLIENT REQUEST, DO NOT, JUST DONT, SERVICE WORKER ONLY SUPPORTS FETCH SERVICE  */
    this.swPush.notificationClicks.subscribe(({ action, notification }) => {
      window.open(notification.data.url);
    });

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
      if (isStable) {
        const timeInterval = interval(8 * 60 * 60 * 1000);

        timeInterval.subscribe(() => {
          this._update.checkForUpdate().then(() => console.log('checked'));
          console.log('update checked');
        });
      }
    });
  }

  pushSubscription(): void {
    if (!this.swPush.isEnabled) {
      console.log('Notification is not enabled');
      return;
    }

    this.swPush
      .requestSubscription({
        serverPublicKey: this.publicKey,
      })
      .then((sub) => {
        console.log(JSON.stringify(sub));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  postSync(): void {
    let obj = {
      name: 'Alvin',
    };
    this._http.post('http://localhost:3000/data', obj).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        this.indexDB
          .addUser(obj.name)
          .then((res) => {
            this.backgroundSync();
          })
          .catch((err) => {
            console.error(err);
          });
      }
    );
  }

  backgroundSync(): void {
    navigator.serviceWorker.ready
      .then((swRegistration: any) => swRegistration.sync.register('post-data'))
      .catch((err) => {
        console.error(err);
      });
  }
}
