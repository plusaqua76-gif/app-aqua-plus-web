import { Component, OnInit, HostListener, signal } from '@angular/core';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BodyComponent } from './body';
import { Header } from './header';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [SidenavComponent, BodyComponent, Header],
  template: `
    <app-header
      [collapsed]="isSideNavCollapsed()"
      [screenWidth]="screenWidth()"
    ></app-header>
    <app-sidenav (onToggleSideNav)="onToggleSideNav($event)"></app-sidenav>
    <app-body
      [collapsed]="isSideNavCollapsed()"
      [screenWidth]="screenWidth()"
    ></app-body>
  `,
  styles: [],
})
export class AppShellComponent implements OnInit {
  isSideNavCollapsed = signal(false);
  screenWidth = signal(0);

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth.set(window.innerWidth);
  }

  ngOnInit(): void {
    this.screenWidth.set(window.innerWidth);
  }

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth.set(data.screenWidth);
    this.isSideNavCollapsed.set(data.collapsed);
  }
}
