import { CommonModule, Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,FontAwesomeModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})


export class NavbarComponent {

  constructor(private location: Location,
    private router: Router
  ){}

  faArrowLeft=faArrowLeft;
  @Input() userRole: string = '';

  goBack() {
    this.router.navigate(['/login']); // Make sure to import Location from '@angular/common'
  }
}