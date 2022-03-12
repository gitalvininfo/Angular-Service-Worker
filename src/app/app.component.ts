import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'pwa';
  todos: any[] = [];

  constructor(private _http: HttpClient) {}

  ngOnInit(): void {
    const url = 'https://jsonplaceholder.typicode.com/todos';

    this._http.get(url).subscribe((res: any) => {
      console.log(res);
      this.todos = res;
    });
  }
}
