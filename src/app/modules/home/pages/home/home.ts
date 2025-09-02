import { Component } from '@angular/core';
import { Welcome } from '@components/welcome';
import { SidenavComponent } from "@components/sidenav/sidenav.component";
import { BodyComponent } from "@components/body";


interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-home',
  imports: [ SidenavComponent, BodyComponent],
  template: `

<app-sidenav (onToggleSideNav)="onToggleSideNav($event)"></app-sidenav>
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
