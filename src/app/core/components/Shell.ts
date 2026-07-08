import { Component, OnInit, HostListener, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BodyComponent } from './body';
import { Header } from './header';
import { NavProgress } from './nav-progress';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [SidenavComponent, BodyComponent, Header, NavProgress],
  template: `
    <app-nav-progress></app-nav-progress>
    <app-header
      [collapsed]="isSideNavCollapsed()"
      [screenWidth]="screenWidth()"
    ></app-header>
    <app-sidenav (toggleSideNav)="onToggleSideNav($event)"></app-sidenav>
    <app-body
      [collapsed]="isSideNavCollapsed()"
      [screenWidth]="screenWidth()"
    ></app-body>
  `,
  styles: [],
})
export class AppShellComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  isSideNavCollapsed = signal(false);
  screenWidth = signal(0);

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.isBrowser) {
      this.screenWidth.set(window.innerWidth);
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.screenWidth.set(window.innerWidth);
    }
  }

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth.set(data.screenWidth);
    this.isSideNavCollapsed.set(data.collapsed);
  }
}
