import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { DocumentAzureBlobService } from '../../services/document-azure-blob.service';
import { environment } from '../../../../environments/environment.prod';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InvoiceTemplate, InvoiceTemplateResponse } from '@interfaces/bill/Iinvoice-template';
import { ToastService } from '@services/toast.service';

interface BillElement {
  id: string;
  type: 'text' | 'image' | 'table' | 'line' | 'rectangle' | 'logo';
  content: string;
  imageUrl?: string;
  styles: {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    border?: string;
    borderRadius?: number;
    opacity?: number;
    textAlign?: 'left' | 'center' | 'right';
  };
  editable: boolean;
}

@Component({
  selector: 'app-back-fill',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="bill-editor w-full bg-transparent flex relative" style="min-height: 600px;">
      <!-- Botón para mostrar sidebar cuando esté oculto -->
      @if (!sidebarOpen()) {
        <button
          (click)="toggleSidebar()"
          class="absolute top-4 left-8 z-50 text-white bg-white/20 dark:bg-slate-700/50 backdrop-blur-xl hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 shadow-lg transition-all duration-300"
          type="button"
          title="Mostrar configuraciones"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
          </svg>
        </button>
      }

      <!-- Sidebar de configuraciones -->
      <div
        class="absolute top-0 left-0 z-40 h-full overflow-y-auto transition-all duration-300 bg-white/20 dark:bg-slate-800/50 backdrop-blur-xl rounded-lg"
        [class.w-80]="sidebarOpen()"
        [class.w-0]="!sidebarOpen()"
        [class.p-4]="sidebarOpen()"
        [class.p-0]="!sidebarOpen()"
        [class.bg-white-20]="sidebarOpen()"
        [class.dark:bg-slate-800-50]="sidebarOpen()"
        [class.backdrop-blur-xl]="sidebarOpen()"
        [class.shadow-lg]="sidebarOpen()"
        [class.border-r]="sidebarOpen()"
        [class.border-gray-200]="sidebarOpen()"
        [class.dark:border-slate-700]="sidebarOpen()"
        [class.opacity-0]="!sidebarOpen()"
        [class.opacity-100]="sidebarOpen()"
        [class.invisible]="!sidebarOpen()"
        [class.visible]="sidebarOpen()"
        style="border-radius: 0 12px 12px 0;"
      >
        <!-- Header del sidebar -->
        <div class="flex items-center justify-between mb-4">
          <h5 class="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase">Configuraciones</h5>
          <button
            type="button"
            (click)="toggleSidebar()"
            class="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center transition-colors"
            title="Ocultar sidebar"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>

        <!-- Elementos disponibles -->
        <div class="mb-6">
          <h3 clss="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Elementos</h3>
          <div
            cdkDropList
            #toolbarList="cdkDropList"
            [cdkDropListData]="availableElements()"
            [cdkDropListConnectedTo]="[canvasList]"
            class="element-list grid grid-cols-2 gap-3"
          >
            @for (element of availableElements(); track element.id) {
              <div class="relative w-full group">
                <div
                  cdkDrag
                  [cdkDragData]="element"
                  class="element-item-inner relative z-40 cursor-grab active:cursor-grabbing bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl flex flex-col items-center justify-center h-24 w-full rounded-xl border border-white/30 dark:border-slate-600/30 shadow-lg"
                >
                  <i class="{{ getElementIconClass(element.type) }} text-2xl text-gray-700 dark:text-white/80 mb-1"></i>
                  <span class="font-medium text-gray-700 dark:text-gray-200 text-xs">{{ getElementLabel(element.type) }}</span>
                </div>
                <div
                  class="absolute border opacity-0 group-hover:opacity-80 pointer-events-none transition-opacity duration-300 border-dashed border-sky-400 dark:border-sky-300 inset-0 z-30 bg-transparent flex items-center justify-center h-24 w-full rounded-xl"
                ></div>
              </div>
            }
          </div>
        </div>

        <!-- Propiedades del elemento seleccionado -->
        @if (selectedElement()) {
          <div class="pt-4 border-t border-gray-200 dark:border-gray-600">
            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">Propiedades</h4>

            <div class="space-y-3">
              <!-- Contenido -->
              @if (selectedElement()?.type === 'text') {
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Texto</label>
                  <textarea
                    [(ngModel)]="selectedElement()!.content"
                    class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white"
                    rows="3"
                    (input)="updateElement()"
                  ></textarea>
                </div>
              }

              <!-- Carga de imagen -->
              @if (selectedElement()?.type === 'image') {
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Imagen</label>
                  <div class="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      (change)="onImageSelected($event, selectedElement()!)"
                      class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                    >
                    @if (selectedElement()!.imageUrl) {
                      <div class="text-xs text-green-600 dark:text-green-400">
                        ✓ Imagen cargada
                      </div>
                    }
                    @if (selectedElement()!.imageUrl) {
                      <button
                        (click)="removeImage(selectedElement()!)"
                        class="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800/30"
                      >
                        Quitar imagen
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Negrita -->
              @if (selectedElement()?.type === 'text') {
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Estilo</label>
                  <button
                    type="button"
                    (click)="toggleBold()"
                    [class.bg-blue-500]="selectedElement()!.styles.fontWeight === 'bold'"
                    [class.border-blue-500]="selectedElement()!.styles.fontWeight === 'bold'"
                    class="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-600/50 transition-colors flex items-center justify-center"
                    title="Negrita"
                  >
                    <span class="text-xl font-bold text-gray-700 dark:text-gray-200">B</span>
                  </button>
                </div>
              }

              <!-- Tamaño de fuente -->
              @if (selectedElement()?.type === 'text') {
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tamaño</label>
                  <input
                    type="number"
                    [(ngModel)]="selectedElement()!.styles.fontSize"
                    class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white"
                    min="8"
                    max="72"
                    (input)="updateElement()"
                  >
                </div>
              }



              <!-- Color de texto -->
              @if (selectedElement()?.type === 'text') {
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Color</label>
                  <input
                    type="color"
                    [(ngModel)]="selectedElement()!.styles.color"
                    class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    (input)="updateElement()"
                  >
                </div>
              }

              <!-- Alineación -->
              @if (selectedElement()?.type === 'text') {
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Alineación</label>
                  <select
                    [(ngModel)]="selectedElement()!.styles.textAlign"
                    class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white"
                    (change)="updateElement()"
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
              }

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Ancho</label>
                  <input
                    type="number"
                    [(ngModel)]="selectedElement()!.styles.width"
                    class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white"
                    min="10"
                    (input)="updateElement()"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Alto</label>
                  <input
                    type="number"
                    [(ngModel)]="selectedElement()!.styles.height"
                    class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white"
                    min="10"
                    (input)="updateElement()"
                  >
                </div>
              </div>

              <!-- Color de fondo -->
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Fondo</label>
                <input
                  type="color"
                  [(ngModel)]="selectedElement()!.styles.backgroundColor"
                  class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  (input)="updateElement()"
                >
              </div>

              <!-- Border Radius para imágenes y rectángulos -->
              @if (selectedElement()?.type === 'image' || selectedElement()?.type === 'rectangle') {
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Bordes Redondeados</label>
                  <input
                    type="range"
                    [(ngModel)]="selectedElement()!.styles.borderRadius"
                    class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    min="0"
                    max="50"
                    (input)="updateElement()"
                  >
                  <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0px</span>
                    <span class="font-medium">{{ selectedElement()!.styles.borderRadius || 0 }}px</span>
                    <span>50px</span>
                  </div>
                </div>
              }

              <!-- Opacidad para imágenes -->
              @if (selectedElement()?.type === 'image') {
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Opacidad</label>
                  <input
                    type="range"
                    [(ngModel)]="selectedElement()!.styles.opacity"
                    class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    min="0"
                    max="100"
                    (input)="updateElement()"
                  >
                  <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span class="font-medium">{{ selectedElement()!.styles.opacity || 100 }}%</span>
                    <span>100%</span>
                  </div>
                </div>
              }
            </div>

            <!-- Botón eliminar -->
            <button
              (click)="deleteElement(selectedElement()!.id)"
              class="w-full mt-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-600 dark:text-red-400 py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Eliminar Elemento
            </button>
          </div>
        }
      </div>

      <!-- Canvas de edición -->
      <div class="flex-1 transition-all duration-300 relative"
           [class.ml-80]="sidebarOpen()"
           [class.ml-0]="!sidebarOpen()">
        <div class="p-4 pt-0 h-full">
          <div class="bill-canvas-container rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl shadow-lg overflow-hidden h-full border border-white/20 dark:border-slate-700/30">
            <!-- Header del canvas -->
            <div class="canvas-header bg-white/50 dark:bg-slate-700/50 backdrop-blur-md p-4 border-b border-gray-200/50 dark:border-slate-600/50 transition-all duration-300"
                 [class.pl-16]="!sidebarOpen()"
                 [class.pl-4]="sidebarOpen()">
              <div class="flex justify-between items-center">
                <div class="flex flex-col">
                  <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">Editor de Factura</h2>
                  @if (existingTemplate()) {
                    <span class="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Plantilla cargada: {{ existingTemplate()?.descripcion }}
                    </span>
                  }
                  @if (isLoadingTemplate()) {
                    <span class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                     Cargando plantilla...
                    </span>
                  }
                </div>
                <div class="flex space-x-2">
                  @if (existingTemplate()) {
                    <button
                      (click)="previewRenderedHTML()"
                      class="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-lg transition-colors text-sm"
                      title="Ver plantilla cargada"
                    >
                       Ver diseño actual
                    </button>
                  }
                  <button
                    (click)="clearCanvas()"
                    class="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                     Limpiar
                  </button>
                  <button
                    (click)="saveInvoiceTemplate()"
                    class="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                    [title]="existingTemplate() ? 'Actualizar plantilla existente' : 'Crear nueva plantilla'"
                  >
                     {{ existingTemplate() ? 'Actualizar' : 'Crear' }} Plantilla
                  </button>
                </div>
              </div>
            </div>

            <!-- Canvas principal -->
            <div class="canvas-wrapper p-4 overflow-auto" style="height: calc(100% - 80px);">

              <div
                #billCanvas
                cdkDropList
                #canvasList="cdkDropList"
                [cdkDropListData]="canvasElements()"
                [cdkDropListConnectedTo]="[toolbarList]"
                [cdkDropListSortingDisabled]="true"
                [cdkDropListAutoScrollDisabled]="false"
                (cdkDropListDropped)="onElementDrop($event)"
                class="bill-canvas relative bg-white dark:bg-white border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
                style="width: 1114px; height: 1160px; margin: 0 auto;"
                (click)="onCanvasClick($event)"
              >
                @for (element of canvasElements(); track element.id) {
                  <div
                    cdkDrag
                    [cdkDragDisabled]="isResizingSignal()"
                    [cdkDragData]="element"
                    [cdkDragFreeDragPosition]="{ x: element.styles.x, y: element.styles.y }"
                    (cdkDragEnded)="onElementMoved($event, element)"
                    (click)="selectElement(element, $event)"
                    class="canvas-element absolute cursor-grab active:cursor-grabbing"
                    [class.selected]="selectedElement()?.id === element.id"
                    [style.width.px]="element.styles.width"
                    [style.height.px]="element.styles.height"
                    [style.left.px]="element.styles.x"
                    [style.top.px]="element.styles.y"
                  >
                  <!-- Elemento de texto -->
                  @if (element.type === 'text') {
                    <div
                      class="element-text h-full w-full p-1 border border-transparent hover:border-blue-300 transition-colors"
                      [style.font-size.px]="element.styles.fontSize"
                      [style.color]="element.styles.color"
                      [style.background-color]="element.styles.backgroundColor"
                      [style.text-align]="element.styles.textAlign"
                      [style.font-weight]="element.styles.fontWeight"
                      (dblclick)="enableEdit(element); $event.stopPropagation()"
                    >
                      @if (!element.editable) {
                        <div class="h-full flex items-center pointer-events-none" [style.justify-content]="getJustifyContent(element.styles.textAlign)">
                          {{ element.content }}
                        </div>
                      }
                      @if (element.editable) {
                        <textarea
                          [(ngModel)]="element.content"
                          (blur)="disableEdit(element)"
                          (keydown.enter)="$event.preventDefault(); disableEdit(element)"
                          (mousedown)="$event.stopPropagation()"
                          class="w-full h-full resize-none border-none outline-none bg-transparent"
                          [style.font-size.px]="element.styles.fontSize"
                          [style.color]="element.styles.color"
                          [style.text-align]="element.styles.textAlign"
                          [style.font-weight]="element.styles.fontWeight"
                          #editInput
                        ></textarea>
                      }
                    </div>
                  }

                  <!-- Elemento de imagen -->
                  @if (element.type === 'image') {
                    <div
                      class="element-image h-full w-full border border-transparent hover:border-blue-300 transition-colors bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden"
                      [style.background-color]="element.styles.backgroundColor"
                      [style.border-radius.px]="element.styles.borderRadius || 0"
                      [style.opacity]="(element.styles.opacity || 100) / 100"
                      (dblclick)="openImageSelector(element)"
                    >
                      @if (element.imageUrl) {
                        <img
                          [src]="element.imageUrl"
                          [alt]="element.content || 'Imagen'"
                          class="w-full h-full object-cover"
                          [style.border-radius.px]="element.styles.borderRadius || 0"
                        >
                      } @else {
                        <div class="text-center text-gray-500 dark:text-gray-400">
                          <span class="text-2xl block mb-1">📷</span>
                          <span class="text-sm">Carga la imagen</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- Elemento de línea -->
                  @if (element.type === 'line') {
                    <div
                      class="element-line h-full w-full"
                      [style.border-top]="'2px solid ' + (element.styles.color || '#000')"
                    >
                    </div>
                  }

                  <!-- Elemento de rectángulo -->
                  @if (element.type === 'rectangle') {
                    <div
                      class="element-rectangle h-full w-full border-2"
                      [style.background-color]="element.styles.backgroundColor"
                      [style.border-radius.px]="element.styles.borderRadius || 0"
                    >
                    </div>
                  }

                  <!-- Controles de redimensionamiento -->
                  @if (selectedElement()?.id === element.id) {
                    <div class="resize-handles absolute inset-0 pointer-events-none">
                      <div
                        class="resize-handle resize-handle-nw"
                        (mousedown)="startResize($event, element, 'nw')"
                      ></div>
                      <div
                        class="resize-handle resize-handle-ne"
                        (mousedown)="startResize($event, element, 'ne')"
                      ></div>
                      <div
                        class="resize-handle resize-handle-sw"
                        (mousedown)="startResize($event, element, 'sw')"
                      ></div>
                      <div
                        class="resize-handle resize-handle-se"
                        (mousedown)="startResize($event, element, 'se')"
                      ></div>
                    </div>
                  }
                  </div>
                }

                <!-- Mensaje cuando el canvas está vacío -->
                @if (canvasElements().length === 0) {
                  <div class="empty-canvas flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <div class="text-center">
                      <p class="text-xl mb-2">🎨</p>
                      <p>Arrastra elementos aquí para comenzar a diseñar tu factura</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bill-editor {
      font-family: 'Inter', sans-serif;
    }

    .canvas-element.selected {
      outline: 2px solid #3b82f6;
      outline-offset: 1px;
    }

    .canvas-element:hover {
      outline: 1px solid #93c5fd;
      outline-offset: 1px;
    }

    .resize-handles {
      pointer-events: none;
    }

    .resize-handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #3b82f6;
      border: 1px solid white;
      border-radius: 50%;
      pointer-events: all;
      cursor: pointer;
    }

    .resize-handle-nw {
      top: -4px;
      left: -4px;
      cursor: nw-resize;
    }

    .resize-handle-ne {
      top: -4px;
      right: -4px;
      cursor: ne-resize;
    }

    .resize-handle-sw {
      bottom: -4px;
      left: -4px;
      cursor: sw-resize;
    }

    .resize-handle-se {
      bottom: -4px;
      right: -4px;
      cursor: se-resize;
    }

    /* Efecto hover 3D - NO aplicar a elementos con cdkDrag */
    .element-list .group:hover .element-item-inner {
      transform: translate(8px, -8px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
      will-change: transform;
    }

    /* Transición suave SOLO en el grupo wrapper, no en cdkDrag */
    .element-list .group .element-item-inner {
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* IMPORTANTE: Deshabilitar transiciones durante el drag */
    .cdk-drag-dragging .element-item-inner {
      transition: none !important;
      transform: none !important;
    }

    /* Deshabilitar hover durante drag */
    .cdk-drop-list-dragging .group:hover .element-item-inner {
      transform: none !important;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      opacity: 0.9;
      transition: none !important;
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .element-list .cdk-drop-list-dragging .group:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .bill-canvas.cdk-drop-list-receiving {
      background-color: #f0f9ff;
    }

    .bill-canvas.cdk-drop-list-dragging {
      background-color: #fafafa;
    }

    /* Estilos adicionales para el sidebar responsivo */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    .duration-300 {
      transition-duration: 300ms;
    }

    /* Overflow hidden cuando el sidebar está cerrado */
    .sidebar-closed {
      overflow: hidden;
    }

    /* Botón flotante cuando el sidebar está cerrado */
    .fixed {
      position: fixed;
    }

    .z-50 {
      z-index: 50;
    }

    /* Mejoras visuales para el botón de toggle */
    .shadow-lg {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class BackFill {
  @ViewChild('billCanvas', { static: false }) billCanvas!: ElementRef;

  // Servicios inyectados
  private documentService = inject(DocumentAzureBlobService);
  private sanitizer = inject(DomSanitizer);
  private toast = inject(ToastService);

  // Señales para el estado del componente
  canvasElements = signal<BillElement[]>([]);
  selectedElement = signal<BillElement | null>(null);
  sidebarOpen = signal<boolean>(true);
  isResizingSignal = signal<boolean>(false);

  // Señales para plantillas de factura
  existingTemplate = signal<InvoiceTemplateResponse | null>(null);
  renderedHTML = signal<SafeHtml | null>(null);
  isLoadingTemplate = signal<boolean>(false);

  // Variables para el redimensionamiento
  private isResizing = false;
  private resizeHandle: string = '';
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 0;
  private resizeStartHeight = 0;
  private resizeStartLeft = 0;
  private resizeStartTop = 0;

  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);


   readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  constructor() {
    // Cargar plantilla existente al inicializar el componente
    if (this.isBrowser) {
      this.loadExistingTemplate();
    }
  }


  // Elementos disponibles en la toolbar
  availableElements = signal<BillElement[]>([
    {
      id: 'text-template',
      type: 'text',
      content: 'Texto de ejemplo',
      styles: {
        x: 0,
        y: 0,
        width: 250,
        height: 45,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        textAlign: 'left'
      },
      editable: false
    },
    {
      id: 'image-template',
      type: 'image',
      content: '',
      styles: {
        x: 0,
        y: 0,
        width: 180,
        height: 120,
        backgroundColor: '#f3f4f6',
        borderRadius: 0,
        opacity: 100
      },
      editable: false
    },
    {
      id: 'line-template',
      type: 'line',
      content: '',
      styles: {
        x: 0,
        y: 0,
        width: 300,
        height: 2,
        color: '#000000'
      },
      editable: false
    },
    {
      id: 'rectangle-template',
      type: 'rectangle',
      content: '',
      styles: {
        x: 0,
        y: 0,
        width: 200,
        height: 120,
        color: '#000000',
        backgroundColor: 'transparent',
        borderRadius: 0
      },
      editable: false
    }
  ]);

  toggleSidebar() {
    this.sidebarOpen.update(isOpen => !isOpen);
  }


  getElementIconClass(type: string): string {
    const icons: { [key: string]: string } = {
      'text': 'fas fa-font',
      'image': 'fas fa-image',
      'line': 'fas fa-minus',
      'rectangle': 'fas fa-square',
      'logo': 'fas fa-building'
    };
    return icons[type] || 'fas fa-file';
  }

  getElementLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'text': 'Texto',
      'image': 'Imagen',
      'line': 'Línea',
      'rectangle': 'Rectángulo',
      'logo': 'Logo'
    };
    return labels[type] || 'Elemento';
  }

  onElementDrop(event: CdkDragDrop<BillElement[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const droppedElement = event.item.data as BillElement;

      let x = 50;
      let y = 50;

      if (event.dropPoint && this.billCanvas) {
        const canvasRect = this.billCanvas.nativeElement.getBoundingClientRect();
        x = Math.max(0, Math.min(event.dropPoint.x - canvasRect.left, 1114 - droppedElement.styles.width));
        y = Math.max(0, Math.min(event.dropPoint.y - canvasRect.top, 1160 - droppedElement.styles.height));
      }

      const newElement: BillElement = {
        ...droppedElement,
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        styles: {
          ...droppedElement.styles,
          x: x,
          y: y
        }
      };

      this.canvasElements.update(elements => [...elements, newElement]);
      this.selectElement(newElement);
    }
  }

  onElementMoved(event: any, element: BillElement) {
    const position = event.distance;
    element.styles.x += position.x;
    element.styles.y += position.y;

    // Asegurar que el elemento no salga del canvas (1114x1160)
    element.styles.x = Math.max(0, Math.min(element.styles.x, 1114 - element.styles.width));
    element.styles.y = Math.max(0, Math.min(element.styles.y, 1160 - element.styles.height));

    this.updateElement();
  }

  selectElement(element: BillElement, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedElement.set(element);
  }

  onCanvasClick(event: Event) {
    // Deseleccionar elemento si se hace click en el canvas
    this.selectedElement.set(null);
  }

  startResize(event: MouseEvent, element: BillElement, handle: string) {
    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.isResizingSignal.set(true);
    this.resizeHandle = handle;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartWidth = element.styles.width;
    this.resizeStartHeight = element.styles.height;
    this.resizeStartLeft = element.styles.x;
    this.resizeStartTop = element.styles.y;

    // Agregar listeners globales
    const onMouseMove = (e: MouseEvent) => this.onResize(e, element);
    const onMouseUp = () => this.stopResize(onMouseMove, onMouseUp);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Prevenir selección de texto durante el resize
    document.body.style.userSelect = 'none';
  }

  private onResize(event: MouseEvent, element: BillElement) {
    if (!this.isResizing) return;

    const deltaX = event.clientX - this.resizeStartX;
    const deltaY = event.clientY - this.resizeStartY;

    let newWidth = this.resizeStartWidth;
    let newHeight = this.resizeStartHeight;
    let newX = this.resizeStartLeft;
    let newY = this.resizeStartTop;

    // Calcular nuevas dimensiones según el handle
    switch (this.resizeHandle) {
      case 'se': // Sureste - esquina inferior derecha
        newWidth = Math.max(20, this.resizeStartWidth + deltaX);
        newHeight = Math.max(20, this.resizeStartHeight + deltaY);
        break;

      case 'sw': // Suroeste - esquina inferior izquierda
        newWidth = Math.max(20, this.resizeStartWidth - deltaX);
        newHeight = Math.max(20, this.resizeStartHeight + deltaY);
        newX = this.resizeStartLeft + (this.resizeStartWidth - newWidth);
        break;

      case 'ne': // Noreste - esquina superior derecha
        newWidth = Math.max(20, this.resizeStartWidth + deltaX);
        newHeight = Math.max(20, this.resizeStartHeight - deltaY);
        newY = this.resizeStartTop + (this.resizeStartHeight - newHeight);
        break;

      case 'nw': // Noroeste - esquina superior izquierda
        newWidth = Math.max(20, this.resizeStartWidth - deltaX);
        newHeight = Math.max(20, this.resizeStartHeight - deltaY);
        newX = this.resizeStartLeft + (this.resizeStartWidth - newWidth);
        newY = this.resizeStartTop + (this.resizeStartHeight - newHeight);
        break;
    }

    // Asegurar que el elemento no salga del canvas
    newX = Math.max(0, Math.min(newX, 1114 - newWidth));
    newY = Math.max(0, Math.min(newY, 1160 - newHeight));
    newWidth = Math.min(newWidth, 1114 - newX);
    newHeight = Math.min(newHeight, 1160 - newY);

    // Actualizar el elemento
    element.styles.width = newWidth;
    element.styles.height = newHeight;
    element.styles.x = newX;
    element.styles.y = newY;

    this.updateElement();
  }

  private stopResize(onMouseMove: (e: MouseEvent) => void, onMouseUp: () => void) {
    this.isResizing = false;
    this.isResizingSignal.set(false);
    this.resizeHandle = '';

    // Remover listeners
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    // Restaurar selección de texto
    document.body.style.userSelect = '';
  }

  enableEdit(element: BillElement) {
    if (element.type === 'text') {
      element.editable = true;
      this.isResizingSignal.set(true); // Deshabilitar drag mientras se edita

      // Focus en el textarea
      setTimeout(() => {
        const textareas = document.querySelectorAll('.canvas-element textarea');
        textareas.forEach(textarea => {
          const ta = textarea as HTMLTextAreaElement;
          if (ta.value === element.content) {
            ta.focus();
            ta.select();
          }
        });
      }, 0);
    }
  }

  disableEdit(element: BillElement) {
    element.editable = false;
    this.isResizingSignal.set(false); // Reactivar drag
    this.updateElement();
  }

  updateElement() {
    // Forzar detección de cambios
    this.canvasElements.update(elements => [...elements]);
  }

  deleteElement(elementId: string) {
    this.canvasElements.update(elements => elements.filter(el => el.id !== elementId));
    this.selectedElement.set(null);
  }

  clearCanvas() {
    this.toast.info("info", 'Factura limpiado correctamente.');
     this.canvasElements.set([]);
      this.selectedElement.set(null);
  }

  loadTemplate(templateData: any) {
    if (templateData && templateData.elements) {
      this.canvasElements.set(templateData.elements);
      this.selectedElement.set(null);
    }
  }

  // Métodos para manejo de imágenes
  onImageSelected(event: Event, element: BillElement) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        element.imageUrl = imageUrl;
        element.content = file.name;
        this.updateElement();
      };

      reader.readAsDataURL(file);
    } else {
      alert('Por favor selecciona un archivo de imagen válido');
    }
  }

  openImageSelector(element: BillElement) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event) => {
      this.onImageSelected(event, element);
    };

    this.selectElement(element);
    input.click();
  }

  removeImage(element: BillElement) {
    element.imageUrl = undefined;
    element.content = '';
    this.updateElement();
  }

  async downloadHTML() {
    const elements = this.canvasElements();

    if (elements.length === 0) {
      this.toast.warning("warning", 'No hay elementos en el canvas para generar HTML');
      return;
    }

    const hasImages = elements.some(el => el.type === 'image' && el.imageUrl && el.imageUrl.startsWith('data:'));
    if (hasImages) {
      this.toast.info("info", 'Creando su factura, por favor espera...');
    }

    try {
      const processedElements = await this.uploadImagesToAzure(elements);
      const htmlContent = this.generateBillContentHTML(processedElements);
      this.toast.success("success", 'factura creada correctamente.');
    } catch (error) {
      this.toast.error("error", 'Error al subir las imágenes a Azure. Por favor, intenta nuevamente.');
    }
  }

  private async uploadImagesToAzure(elements: BillElement[]): Promise<BillElement[]> {
    const processedElements: BillElement[] = [];

    for (const element of elements) {
      if (element.type === 'image' && element.imageUrl && element.imageUrl.startsWith('data:')) {
        try {
          // Extraer información del base64
          const base64Data = element.imageUrl.split(',')[1];
          const mimeType = element.imageUrl.split(';')[0].split(':')[1];
          const extension = mimeType.split('/')[1];

          // Generar nombre único para la imagen
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 9);
          const fileName = element.content || `imagen_${timestamp}_${randomStr}`;
          const fileNameWithExt = fileName.includes('.') ? fileName : `${fileName}.${extension}`;

          const documentUpload = {
            base64File: base64Data,
            idEmpresa: this.empresaId() || 0,
            nombreArchivo: fileNameWithExt,
            extension: extension,
            usuario: this.nombreUsuario() || 'desconocido',
            categoriaCodigo: 'FACIMG',
            publico: true
          };

          const response = await firstValueFrom(this.documentService.documentIploadUrl(documentUpload));
          if (response.success && response.response.ruta) {
            const fullUrl = `${environment.azureBlobStorageUrl}${response.response.ruta}`;

            processedElements.push({
              ...element,
              imageUrl: fullUrl
            });
          } else {
            throw new Error(`No se pudo subir la imagen: ${fileNameWithExt}`);
          }
        } catch (error) {
          console.error('Error al subir imagen:', error);
          throw new Error(`Error al subir imagen a Azure: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      } else {
        processedElements.push(element);
      }
    }
    return processedElements;
  }

  private generateBillContentHTML(elements: BillElement[]): string {
    // Generar solo el contenido HTML sin documento completo
    const elementsHTML = elements.map(element => {
      const commonStyles = `position: absolute; left: ${element.styles.x}px; top: ${element.styles.y}px; width: ${element.styles.width}px; height: ${element.styles.height}px; background-color: ${element.styles.backgroundColor || 'transparent'}; border-radius: ${element.styles.borderRadius || 0}px; opacity: ${(element.styles.opacity || 100) / 100}; box-sizing: border-box;`;

      switch (element.type) {
        case 'text':
          const justifyContent = element.styles.textAlign === 'center' ? 'center' : element.styles.textAlign === 'right' ? 'flex-end' : 'flex-start';
          return `<div style="${commonStyles} font-size: ${element.styles.fontSize || 14}px; color: ${element.styles.color || '#000'}; text-align: ${element.styles.textAlign || 'left'}; font-weight: ${element.styles.fontWeight || 'normal'}; display: flex; align-items: center; justify-content: ${justifyContent}; padding: 4px;">${element.content}</div>`;

        case 'image':
          const imageContent = element.imageUrl
            ? `<img src="${element.imageUrl}" alt="${element.content || 'Imagen'}" style="width: 100%; height: 100%; object-fit: cover; border-radius: ${element.styles.borderRadius || 0}px;">`
            : `<div style="display: flex; align-items: center; justify-content: center; color: #666; font-size: 14px; height: 100%;">📷 Imagen</div>`;

          return `<div style="${commonStyles} display: flex; align-items: center; justify-content: center; overflow: hidden;">${imageContent}</div>`;

        case 'line':
          return `<div style="${commonStyles} border-top: 2px solid ${element.styles.color || '#000'};"></div>`;

        case 'rectangle':
          return `<div style="${commonStyles};"></div>`;

        default:
          return '';
      }
    }).join('');

    // Retornar solo el contenido del contenedor con las dimensiones finales
    return `<div style="position: relative; width: 1114px; height: 1160px; margin: 0 auto; background-color: white; font-family: Arial, sans-serif;">${elementsHTML}</div>`;
  }

  private createHTMLModal(htmlContent: string): HTMLElement {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';

    const content = document.createElement('div');
    content.style.cssText = 'background: white; padding: 20px; border-radius: 8px; max-width: 80%; max-height: 80%; overflow: auto;';

    const title = document.createElement('h3');
    title.textContent = 'HTML generado para el backend:';
    title.style.marginTop = '0';

    const textarea = document.createElement('textarea');
    textarea.value = htmlContent;
    textarea.style.cssText = 'width: 100%; height: 300px; font-family: monospace; font-size: 12px;';
    textarea.readOnly = true;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cerrar';
    closeBtn.style.cssText = 'margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;';
    closeBtn.onclick = () => document.body.removeChild(modal);

    content.appendChild(title);
    content.appendChild(textarea);
    content.appendChild(closeBtn);
    modal.appendChild(content);

    return modal;
  }

  async loadExistingTemplate() {
    const empresaId = this.empresaId();
    if (!empresaId) {
      console.warn('No se encontró el ID de empresa');
      return;
    }

    this.isLoadingTemplate.set(true);
    try {
      const apiResponse = await firstValueFrom(
        this.documentService.getInvoiceTemplateByEnterprise(empresaId)
      );


      if (apiResponse.success && apiResponse.response && apiResponse.response.length > 0) {
        // Tomar la primera plantilla encontrada del array response
        const template = apiResponse.response[0];
        this.existingTemplate.set(template);
        this.renderTemplateHTML(template.contenido);
      } else {
        this.existingTemplate.set(null);
      }
    } catch (error) {
      console.error('Error al cargar plantilla existente:', error);
      this.existingTemplate.set(null);
    } finally {
      this.isLoadingTemplate.set(false);
    }
  }

  renderTemplateHTML(htmlContent: string) {
    if (!htmlContent) {
      this.renderedHTML.set(null);
      return;
    }

    // Sanitizar el HTML para seguridad
    const safeHTML = this.sanitizer.sanitize(1, htmlContent) || '';
    this.renderedHTML.set(this.sanitizer.bypassSecurityTrustHtml(safeHTML));
  }

  async saveInvoiceTemplate() {
    const empresaId = this.empresaId();
    const nombreUsuario = this.nombreUsuario();

    if (!empresaId || !nombreUsuario) {
      this.toast.error("error", 'No se encontró información del usuario');
      return;
    }

    const elements = this.canvasElements();
    if (elements.length === 0) {
      this.toast.warning("warning", 'No hay elementos en el canvas para guardar');
      return;
    }

    try {
      const processedElements = await this.uploadImagesToAzure(elements);
      const htmlContent = this.generateBillContentHTML(processedElements);

      const invoiceTemplate: InvoiceTemplate = {
        descripcion: 'Plantilla de factura personalizada para la parte de atrás',
        contenido: htmlContent,
        codigo: 'BACKBILL_PRUEB',
        usuarioCreacion: nombreUsuario,
        empresa: {
          id: empresaId
        }
      };

      const existingTemplateData = this.existingTemplate();
      if (existingTemplateData?.id) {
        invoiceTemplate.id = existingTemplateData.id;
      }

      const response = await firstValueFrom(
        this.documentService.createInvoiceTemplate(invoiceTemplate)
      );
      if (invoiceTemplate.id) {
        this.toast.success("success", 'Plantilla actualizada correctamente.');
      } else {
        this.toast.success("success", 'Plantilla creada correctamente.');
      }

      // Recargar la plantilla para actualizar el estado
      await this.loadExistingTemplate();

    } catch (error) {
      this.toast.error("error", 'Error al guardar la plantilla. Por favor, intenta nuevamente.');
    }
  }

  previewRenderedHTML() {
    const html = this.renderedHTML();
    if (!html) {
      this.toast.info("info", 'No hay plantilla cargada para previsualizar');
      return;
    }

    // Crear un modal con la vista previa
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';

    const content = document.createElement('div');
    content.style.cssText = 'background: white; padding: 20px; border-radius: 8px; max-width: 90%; max-height: 90%; overflow: auto; position: relative;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Cerrar';
    closeBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; padding: 8px 16px; background: #15438c; color: white; border: none; border-radius: 4px; cursor: pointer; z-index: 1;';
    closeBtn.onclick = () => document.body.removeChild(modal);

    const title = document.createElement('h3');
    title.textContent = 'Vista previa de la plantilla cargada';
    title.style.cssText = 'margin-top: 0; margin-bottom: 20px;';

    const previewContainer = document.createElement('div');
    const existingTemplateData = this.existingTemplate();
    if (existingTemplateData) {
      previewContainer.innerHTML = existingTemplateData.contenido;
    }

    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(previewContainer);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  toggleBold() {
    const element = this.selectedElement();
    if (element && element.type === 'text') {
      element.styles.fontWeight = element.styles.fontWeight === 'bold' ? 'normal' : 'bold';
      this.updateElement();
    }
  }

  getJustifyContent(textAlign: 'left' | 'center' | 'right' | undefined): string {
    switch (textAlign) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      default:
        return 'flex-start';
    }
  }
}
