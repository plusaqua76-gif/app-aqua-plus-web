import { Component, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
<div class="body" [ngClass]="getBodyClass()">
    <router-outlet></router-outlet>
</div>
  `,
  styles: [
    `
     .body {
    width: calc(100% - 5rem);
    height: 100vh;
    margin-left: 5rem;
    z-index: 0;
    position: relative;
    top: 0;
    transition: all .5s ease;
    background: #f4f7fa;
    padding: 3rem;
}

.body-trimmed {
    width: calc(100% - 16.5625rem);
    margin-left: 16.5625rem;
}

.body-md-screen {
    width: calc(100% - 5rem);
    margin-left: 5rem;
}

.body-mobile {
    width: 100%;
    margin-left: 0;
}
    `
  ]
})
export class BodyComponent {
  @Input() collapsed = false;
  @Input() screenWidth = 0;

  getBodyClass(): string {
    let styleClass = '';

    if(this.screenWidth <= 768) {
      styleClass = 'body-mobile';
    } else if(this.collapsed && this.screenWidth > 768) {
      // En desktop expandido
      styleClass = 'body-trimmed';
    } else if(!this.collapsed && this.screenWidth > 768) {
      // En desktop colapsado
      styleClass = 'body-md-screen';
    }

    return styleClass;
  }
}
