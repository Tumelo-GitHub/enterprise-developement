import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-contact-person-form',
  templateUrl: './contact-person-form.component.html',
  styleUrls: ['./contact-person-form.component.scss']
})
export class ContactPersonFormComponent {
  @Input() group!: FormGroup;
  @Input() index!: number;
  @Output() remove = new EventEmitter<number>();
}
