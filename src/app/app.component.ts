import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // @HostListener('window:beforeunload', ['$event'])
  // unloadHandler(event: Event) {
  //   localStorage.clear();
  // }

  constructor() { }

  ngOnInit(): void {
    
  }
}
