import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {
  event_ids: number[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  selectedEvent(event: number[]) {
    this.event_ids = event;
    console.log(this.event_ids);
  }

}
