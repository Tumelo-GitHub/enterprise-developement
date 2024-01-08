import { Component, OnInit } from '@angular/core';
import { IProgramme } from 'src/app/shared';

@Component({
  selector: 'app-programme',
  templateUrl: './programme.component.html',
  styleUrls: ['./programme.component.scss']
})
export class ProgrammeComponent implements OnInit {
  programme: IProgramme | undefined;

  constructor() { }

  /**
   * TODO:
   */
  ngOnInit(): void {}

}
