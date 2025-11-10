import { Component } from '@angular/core';
import { SidenavComponent } from '@components/sidenav/sidenav.component';
import { BodyComponent } from '@components/body';
import { SideNavToggle } from '@interfaces/menu/ISideNavToggle';

@Component({
  selector: 'app-home',
  imports: [SidenavComponent, BodyComponent],
  template: `
    <app-sidenav (toggleSideNav)="onToggleSideNav($event)"></app-sidenav>
    <app-body
      [collapsed]="isSideNavCollapsed"
      [screenWidth]="screenWidth"
    ></app-body>
  `,
})
export class Home {
  isSideNavCollapsed = false;
  screenWidth = 0;

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }
}
