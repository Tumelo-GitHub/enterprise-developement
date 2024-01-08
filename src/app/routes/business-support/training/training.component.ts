import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {
  event_id = 0;
  event: any;

  constructor() { }

  ngOnInit(): void {
  }

  selectedEvent(event: any) {
    console.log(event);
    this.event = event;
    this.event_id = event.id;
  }

}
