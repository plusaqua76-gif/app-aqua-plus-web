import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Action, TableComponent } from '@components/table';
import { InventarioService } from '../../service/inventario.service';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { IInventario, IProducto } from '@interfaces/Iaccounting';
import { ProductoService } from '../../service/producto.service';
import { FormsModule } from '@angular/forms';
import { ProductCategoryService } from '../../service/productCategory.service';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, RouterModule, TableComponent, FormsModule],
  templateUrl: './inventory.html',
})
export class Inventory {
  enterpriseId = signal<number | undefined>(
    Number(localStorage.getItem('enterpriseId')) || undefined
  );

  showDeleteConfirm = signal(false);
  itemToDelete: number | null = null;

  showSuggestions = signal(false);

  searchTerm = signal('');

  showNewProductPopup = signal(false);

    newProductData = {
    categoriaId: '',
    codigo: '',
    nombre: '',
    descripcion: ''
  };

  filteredProducts = computed(() => {
    const products = this.dataProductByEnterprise.value() ?? [];
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return products;
    }
    return products.filter(
      (p: { nombre: string }) => p.nombre.toLowerCase().includes(term)
    );
  });

  inventarioColumns = signal([
    { field: 'nombre', header: 'Producto' },
    { field: 'cantidad', header: 'Cantidad (UND)' },
    { field: 'precioUnitario', header: 'Valor unidad' },
    { field: 'porcentaje', header: 'Porcentaje %' },
    { field: 'precioVenta', header: 'Valor venta' },
  ]);

  inventarioData = computed(() => this.dataInventarioCounter.value() ?? []);

  formData = {
  productoId: '',
  cantidad: null,
  valorUnidad: null,
  porcentaje: '',
  iva: false
  };

  categories = signal([]);



  protected readonly inventarioService = inject(InventarioService);
  protected readonly productoService = inject(ProductoService);
  protected readonly productCategory = inject(ProductCategoryService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly toastService = inject(ToastService);

  dataInventarioCounter = rxResource({
    stream: () =>
      this.inventarioService.getInventarioByEnterprise().pipe(
        map((data: { response: IInventario[] }) => {
          return data.response.map((empresaItem) => ({
            id: empresaItem.id,
            nombre: empresaItem.nombre,
            cantidad: empresaItem.cantidad,
            precioUnitario: `$ ${empresaItem.precioUnitario}`,
            porcentaje: `% ${empresaItem.porcentaje}`,
            precioVenta: `$ ${empresaItem.precioVenta}`,
          }));
        })
      ),
  });

  dataProductByEnterprise = rxResource({
  stream: () => {
    const id = this.enterpriseId();
    if (!id) {
      throw new Error('Enterprise ID is required');
    }

    return this.productoService.getProductByIdEnterprise(id).pipe(
      map((data: { response: IProducto[] }) => {
        return data.response.map((productoItem) => ({
          id: productoItem.id,
          nombre: productoItem.nombre
          }));
        })
      );
    }
  });

  dataProductCategory = rxResource({
    stream: () => this.productCategory.getAllProductCategory().pipe(
      map((data: { response: IProducto[] }) => {
        return data.response.map((categoryItem) => ({
          id: categoryItem.id,
          nombre: categoryItem.nombre
        }));
      })
    )
  });

  editar(row: any) {
    const id = row?.id;
    if (id) {
      this.router.navigate(['/inventory/update-inventory/', id], {
        relativeTo: this.route,
      });
    } else {
      this.toastService.error('Error', 'ID de producto no válido.');
    }
  }

  onTableAction(event: Action) {
    if (event.action === 'add') {
      this.router.navigate(['create-inventory'], { relativeTo: this.route });
    } else if (event.action === 'edit' && event.row) {
      this.editar(event.row);
    }
  }

  onDelete(id: number): void {
    this.itemToDelete = id;
    this.showDeleteConfirm.set(true);
  }

  openNewProductPopup() {
    this.showNewProductPopup.set(true);
  }

  closeNewProductPopup() {
    this.showNewProductPopup.set(false);
    this.newProductData = {
      categoriaId: '',
      codigo: '',
      nombre: '',
      descripcion: ''
    };
  }

  createNewProduct() {

    this.toastService.success('Éxito', 'Producto creado (simulado).');
    this.closeNewProductPopup();
  }

  agregarProducto() {
  }

  guardarProducto() {

  }

  calcularValorVentaUnit(): number | null {
    const { valorUnidad, porcentaje } = this.formData;
    if (valorUnidad == null || porcentaje == null || porcentaje === '') {
      return null;
    }
    const porcentajeNumerico = parseFloat(String(porcentaje));
    if (isNaN(porcentajeNumerico)) {
      return null;
    }
    return valorUnidad + (valorUnidad * (porcentajeNumerico / 100));
  }

  selectProduct(producto: { id: number; nombre: string }) {
    this.formData.productoId = producto.id.toString();
    this.searchTerm.set(producto.nombre);
    this.showSuggestions.set(false);
  }
}
