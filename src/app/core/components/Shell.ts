import { Component } from '@angular/core';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BodyComponent } from './body';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [SidenavComponent, BodyComponent],
  template: `
    <app-sidenav (onToggleSideNav)="onToggleSideNav($event)"></app-sidenav>
    <app-body
      [collapsed]="isSideNavCollapsed"
      [screenWidth]="screenWidth"
    ></app-body>
  `,
  styles: [],
})
export class AppShellComponent {
  isSideNavCollapsed = false;
  screenWidth = 0;

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }
}
