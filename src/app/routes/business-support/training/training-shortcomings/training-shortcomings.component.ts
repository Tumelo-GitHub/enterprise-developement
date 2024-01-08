import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-training-shortcomings',
  templateUrl: './training-shortcomings.component.html',
  styleUrls: ['./training-shortcomings.component.scss']
})
export class TrainingShortcomingsComponent implements OnInit {
  @Input() event_id: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

}
