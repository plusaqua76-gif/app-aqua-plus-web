import { Component, ChangeDetectionStrategy, input } from '@angular/core'
import { IImage } from '@interfaces/image/image'
import { NgOptimizedImage } from '@angular/common'
@Component({
  selector: 'app-image',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
  <img loading="lazy"
    [ngSrc]="images()?.imgPath ?? ''"
    [alt]="images()?.name"
    [class]="class()"
    [width]="images()?.width"
    [height]="images()?.height"
  />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Image {
  images = input<IImage>()
  class = input<string>()
}
