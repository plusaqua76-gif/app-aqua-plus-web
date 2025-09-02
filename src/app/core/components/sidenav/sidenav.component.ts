import { EnterpriseIdService } from '@services/enterpriceId.service';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, Output, EventEmitter, OnInit, HostListener, inject, effect } from '@angular/core';
import { navbarData } from './nav-data';
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HasRoleDirective } from '../../directives/has-role';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';


interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  imports: [CommonModule, NgClass, RouterLink, RouterLinkActive, HasRoleDirective],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('350ms',
          style({opacity: 1})
        )
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate('350ms',
          style({opacity: 0})
        )
      ])
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate('1000ms',
          keyframes([
            style({transform: 'rotate(0deg)', offset: '0'}),
            style({transform: 'rotate(2turn)', offset: '1'})
          ])
        )
      ])
    ])
  ]
})
export class SidenavComponent implements OnInit {

  private enterpriseIdService = inject(EnterpriseIdService);

  enterpriseInfo = rxResource({
    stream: () => this.enterpriseIdService.getEnterpriseInfo()
  })

  constructor() {
    effect(() => {
      const enterpriseData = this.enterpriseInfo.value();
      if (enterpriseData) {
        console.log('Información de la empresa:', enterpriseData);
      }
    });
  }

  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  navData = navbarData;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if(this.screenWidth <= 768 ) {
      this.collapsed = false;
      this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
    } else {
      this.collapsed = false;
      this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
    }
  }

  ngOnInit(): void {
      this.screenWidth = window.innerWidth;
      if(this.screenWidth <= 768) {
        this.collapsed = false;
      } else {
        this.collapsed = false;
      }

      this.onToggleSideNav.emit({
        collapsed: this.collapsed,
        screenWidth: this.screenWidth
      });
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  onImageError(event: any): void {
    console.error('Error al cargar la imagen de la empresa:', event);
    event.target.style.display = 'none';
  }


}
