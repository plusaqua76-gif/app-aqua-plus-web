import { Component } from '@angular/core';
import { Welcome } from '@components/welcome';


@Component({
  selector: 'app-home',
  imports: [Welcome],
  template: `



  <div  class="content">
    <app-Welcome></app-Welcome>
  </div>
  `,
  styles:`
  .content{
    display: grid;
    min-height: 100dvh;
    grid-template-rows: auto 1fr auto;
  }
  `

})
export class Home {}
