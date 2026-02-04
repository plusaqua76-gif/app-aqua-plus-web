import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .neon-checkbox {
      --primary: #3b82f6;
      --primary-dark: #2563eb;
      --primary-light: #93c5fd;
      --size: 30px;
      position: relative;
      width: var(--size);
      height: var(--size);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      display: inline-block;
    }

    .neon-checkbox input {
      display: none;
    }

    .neon-checkbox__frame {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .neon-checkbox__box {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 4px;
      border: 2px solid #2563eb;
      transition: all 0.4s ease;
    }

    .neon-checkbox__check-container {
      position: absolute;
      top: 2px;
      left: 2px;
      right: 2px;
      bottom: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .neon-checkbox__check {
      width: 80%;
      height: 80%;
      fill: none;
      stroke: #3b82f6;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 40;
      stroke-dashoffset: 40;
      transform-origin: center;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .neon-checkbox__glow {
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 6px;
      background: #3b82f6;
      opacity: 0;
      filter: blur(8px);
      transform: scale(1.2);
      transition: all 0.4s ease;
    }

    .neon-checkbox__borders {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 4px;
      overflow: hidden;
    }

    .neon-checkbox__borders span {
      position: absolute;
      width: 40px;
      height: 1px;
      background: #3b82f6;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .neon-checkbox__borders span:nth-child(1) {
      top: 0;
      left: -100%;
      animation: borderFlow1 2s linear infinite;
    }

    .neon-checkbox__borders span:nth-child(2) {
      top: -100%;
      right: 0;
      width: 1px;
      height: 40px;
      animation: borderFlow2 2s linear infinite;
    }

    .neon-checkbox__borders span:nth-child(3) {
      bottom: 0;
      right: -100%;
      animation: borderFlow3 2s linear infinite;
    }

    .neon-checkbox__borders span:nth-child(4) {
      bottom: -100%;
      left: 0;
      width: 1px;
      height: 40px;
      animation: borderFlow4 2s linear infinite;
    }

    .neon-checkbox__particles span {
      position: absolute;
      width: 4px;
      height: 4px;
      background: #3b82f6;
      border-radius: 50%;
      opacity: 0;
      pointer-events: none;
      top: 50%;
      left: 50%;
      box-shadow: 0 0 6px #3b82f6;
    }

    .neon-checkbox__rings {
      position: absolute;
      top: -20px;
      left: -20px;
      right: -20px;
      bottom: -20px;
      pointer-events: none;
    }

    .neon-checkbox__rings .ring {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      border: 1px solid #3b82f6;
      opacity: 0;
      transform: scale(0);
    }

    .neon-checkbox__sparks span {
      position: absolute;
      width: 20px;
      height: 1px;
      background: linear-gradient(90deg, #3b82f6, transparent);
      opacity: 0;
    }

    /* Hover Effects */
    .neon-checkbox:hover .neon-checkbox__box {
      border-color: #3b82f6;
      transform: scale(1.05);
      background: rgba(59, 130, 246, 0.15);
    }

    /* Checked State */
    .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__box {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.2);
    }

    .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__check {
      stroke-dashoffset: 0;
      transform: scale(1.1);
    }

    .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__glow {
      opacity: 0.3;
    }

    .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__borders span {
      opacity: 1;
    }

    /* Particle Animations */
    .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__particles span {
      animation: particleExplosion 0.6s ease-out forwards;
    }

    .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__rings .ring {
      animation: ringPulse 0.6s ease-out forwards;
    }

    .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__sparks span {
      animation: sparkFlash 0.6s ease-out forwards;
    }

    /* Animations */
    @keyframes borderFlow1 {
      0% { transform: translateX(0); }
      100% { transform: translateX(200%); }
    }

    @keyframes borderFlow2 {
      0% { transform: translateY(0); }
      100% { transform: translateY(200%); }
    }

    @keyframes borderFlow3 {
      0% { transform: translateX(0); }
      100% { transform: translateX(-200%); }
    }

    @keyframes borderFlow4 {
      0% { transform: translateY(0); }
      100% { transform: translateY(-200%); }
    }

    @keyframes particleExplosion {
      0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0;
      }
      20% {
        opacity: 1;
      }
      100% {
        transform: translate(
            calc(-50% + var(--x, 20px)),
            calc(-50% + var(--y, 20px))
          )
          scale(0);
        opacity: 0;
      }
    }

    @keyframes ringPulse {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    @keyframes sparkFlash {
      0% {
        transform: rotate(var(--r, 0deg)) translateX(0) scale(1);
        opacity: 1;
      }
      100% {
        transform: rotate(var(--r, 0deg)) translateX(30px) scale(0);
        opacity: 0;
      }
    }

    /* Particle Positions */
    .neon-checkbox__particles span:nth-child(1) { --x: 25px; --y: -25px; }
    .neon-checkbox__particles span:nth-child(2) { --x: -25px; --y: -25px; }
    .neon-checkbox__particles span:nth-child(3) { --x: 25px; --y: 25px; }
    .neon-checkbox__particles span:nth-child(4) { --x: -25px; --y: 25px; }
    .neon-checkbox__particles span:nth-child(5) { --x: 35px; --y: 0px; }
    .neon-checkbox__particles span:nth-child(6) { --x: -35px; --y: 0px; }
    .neon-checkbox__particles span:nth-child(7) { --x: 0px; --y: 35px; }
    .neon-checkbox__particles span:nth-child(8) { --x: 0px; --y: -35px; }
    .neon-checkbox__particles span:nth-child(9) { --x: 20px; --y: -30px; }
    .neon-checkbox__particles span:nth-child(10) { --x: -20px; --y: 30px; }
    .neon-checkbox__particles span:nth-child(11) { --x: 30px; --y: 20px; }
    .neon-checkbox__particles span:nth-child(12) { --x: -30px; --y: -20px; }

    /* Spark Rotations */
    .neon-checkbox__sparks span:nth-child(1) { --r: 0deg; top: 50%; left: 50%; }
    .neon-checkbox__sparks span:nth-child(2) { --r: 90deg; top: 50%; left: 50%; }
    .neon-checkbox__sparks span:nth-child(3) { --r: 180deg; top: 50%; left: 50%; }
    .neon-checkbox__sparks span:nth-child(4) { --r: 270deg; top: 50%; left: 50%; }

    /* Ring Delays */
    .neon-checkbox__rings .ring:nth-child(1) { animation-delay: 0s; }
    .neon-checkbox__rings .ring:nth-child(2) { animation-delay: 0.1s; }
    .neon-checkbox__rings .ring:nth-child(3) { animation-delay: 0.2s; }

    .disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  `],
  template: `
    <label
      class="neon-checkbox"
      [class.disabled]="disabled()"
      [style.--size]="widthHeight()"
    >
      <input
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="onCheckboxChange($event)"
      />
      <div class="neon-checkbox__frame">
        <div class="neon-checkbox__box">
          <div class="neon-checkbox__check-container">
            <svg viewBox="0 0 24 24" class="neon-checkbox__check">
              <path d="M3,12.5l7,7L21,5"></path>
            </svg>
          </div>
          <div class="neon-checkbox__glow"></div>
          <div class="neon-checkbox__borders">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="neon-checkbox__effects">
          <div class="neon-checkbox__particles">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="neon-checkbox__rings">
            <div class="ring"></div>
            <div class="ring"></div>
            <div class="ring"></div>
          </div>
          <div class="neon-checkbox__sparks">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </label>
  `,
})
export class Checkbox {
  widthHeight = input<string>('20px');
  checked = input<boolean>(false);
  disabled = input<boolean>(false);
  checkedChange = output<boolean>();

  onCheckboxChange(event: Event): void {
    if (this.disabled()) return;

    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
  }
}
