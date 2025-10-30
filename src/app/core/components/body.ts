import { Component, input } from '@angular/core';
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
        min-height: 100vh;
        margin-left: 5rem;
        z-index: 0;
        position: relative;
        top: 0;
        transition: all 0.5s ease;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='1440' height='560' preserveAspectRatio='none' viewBox='0 0 1440 560'%3e%3cg mask='url(%26quot%3b%23SvgjsMask1972%26quot%3b)' fill='none'%3e%3crect width='1440' height='560' x='0' y='0' fill='url(%26quot%3b%23SvgjsRadialGradient1973%26quot%3b)'%3e%3c/rect%3e%3cpath d='M1073.601%2c317.841C1110.355%2c320.127%2c1149.018%2c308.792%2c1168.46%2c277.517C1188.837%2c244.738%2c1186.574%2c202.049%2c1165.809%2c169.514C1146.442%2c139.17%2c1109.596%2c129.32%2c1073.601%2c128.892C1036.637%2c128.452%2c995.422%2c134.934%2c977.512%2c167.273C959.941%2c199.001%2c977.679%2c236.292%2c997.19%2c266.866C1014.844%2c294.529%2c1040.848%2c315.804%2c1073.601%2c317.841' fill='rgba(28%2c 83%2c 142%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3cpath d='M732.794%2c507.356C745.896%2c507.094%2c758.022%2c500.52%2c764.689%2c489.237C771.476%2c477.751%2c771.49%2c463.855%2c765.557%2c451.906C758.821%2c438.338%2c747.94%2c424.766%2c732.794%2c424.993C717.875%2c425.217%2c708.586%2c439.632%2c701.688%2c452.863C695.441%2c464.845%2c691.908%2c478.824%2c698.607%2c490.56C705.353%2c502.378%2c719.189%2c507.628%2c732.794%2c507.356' fill='rgba(28%2c 83%2c 142%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3cpath d='M1083.68 388.32 a130.75 130.75 0 1 0 261.5 0 a130.75 130.75 0 1 0 -261.5 0z' fill='rgba(28%2c 83%2c 142%2c 0.4)' class='triangle-float1'%3e%3c/path%3e%3cpath d='M4.682%2c311.474C21.574%2c310.635%2c32.9%2c295.257%2c39.934%2c279.876C45.744%2c267.171%2c43.479%2c253.244%2c36.964%2c240.885C29.857%2c227.403%2c19.883%2c214.088%2c4.682%2c213C-12.134%2c211.797%2c-28.143%2c221.106%2c-36.736%2c235.611C-45.495%2c250.396%2c-45.446%2c268.627%2c-37.211%2c283.71C-28.607%2c299.469%2c-13.251%2c312.365%2c4.682%2c311.474' fill='rgba(28%2c 83%2c 142%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3cpath d='M25.673%2c490.889C49.641%2c490.431%2c66.338%2c470.164%2c78.483%2c449.496C90.846%2c428.456%2c101.935%2c403.155%2c89.598%2c382.099C77.344%2c361.184%2c49.816%2c357.193%2c25.673%2c359.361C5.388%2c361.183%2c-10.414%2c374.661%2c-21.044%2c392.034C-32.294%2c410.421%2c-39.965%2c432.096%2c-30.755%2c451.585C-20.258%2c473.797%2c1.109%2c491.359%2c25.673%2c490.889' fill='rgba(28%2c 83%2c 142%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3cpath d='M583.79 51.37 a127.64 127.64 0 1 0 255.28 0 a127.64 127.64 0 1 0 -255.28 0z' fill='rgba(28%2c 83%2c 142%2c 0.4)' class='triangle-float1'%3e%3c/path%3e%3cpath d='M229.131%2c439.91C244.811%2c440.946%2c259.894%2c432.436%2c267.725%2c418.813C275.533%2c405.231%2c275.057%2c388.075%2c266.455%2c374.982C258.57%2c362.98%2c243.469%2c359.28%2c229.131%2c360.066C216.269%2c360.771%2c204.622%2c367.508%2c198.276%2c378.717C192.024%2c389.76%2c192.75%2c402.906%2c198.463%2c414.237C204.896%2c426.996%2c214.873%2c438.968%2c229.131%2c439.91' fill='rgba(28%2c 83%2c 142%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1972'%3e%3crect width='1440' height='560' fill='white'%3e%3c/rect%3e%3c/mask%3e%3cradialGradient cx='50%25' cy='50%25' r='772.53' gradientUnits='userSpaceOnUse' id='SvgjsRadialGradient1973'%3e%3cstop stop-color='rgba(17%2c 20%2c 24%2c 1)' offset='0.39'%3e%3c/stop%3e%3cstop stop-color='rgba(17%2c 20%2c 24%2c 1)' offset='0.51'%3e%3c/stop%3e%3c/radialGradient%3e%3cstyle%3e %40keyframes float1 %7b 0%25%7btransform: translate(0%2c 0)%7d 50%25%7btransform: translate(-10px%2c 0)%7d 100%25%7btransform: translate(0%2c 0)%7d %7d .triangle-float1 %7b animation: float1 5s infinite%3b %7d %40keyframes float2 %7b 0%25%7btransform: translate(0%2c 0)%7d 50%25%7btransform: translate(-5px%2c -5px)%7d 100%25%7btransform: translate(0%2c 0)%7d %7d .triangle-float2 %7b animation: float2 4s infinite%3b %7d %40keyframes float3 %7b 0%25%7btransform: translate(0%2c 0)%7d 50%25%7btransform: translate(0%2c -10px)%7d 100%25%7btransform: translate(0%2c 0)%7d %7d .triangle-float3 %7b animation: float3 6s infinite%3b %7d %3c/style%3e%3c/defs%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        padding-top: 3rem;
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
        padding-top: 4rem; /* Padding-top para el header en móvil */
      }
    `,
  ],
})
export class BodyComponent {
  collapsed = input<boolean>(false);
  screenWidth = input<number>(0);

  getBodyClass(): string {
    let styleClass = '';

    if (this.screenWidth() <= 768) {
      styleClass = 'body-mobile';
    } else if (this.collapsed() && this.screenWidth() > 768) {
      styleClass = 'body-trimmed';
    } else if (!this.collapsed() && this.screenWidth() > 768) {
      styleClass = 'body-md-screen';
    }

    return styleClass;
  }
}
