import { Component, inject, input } from '@angular/core';
import { AuthStateService } from '../../../shared/data-access/auth-state.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import {
  collection,
  getDocs,
  Firestore,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';

interface Docente {
  id?: string;
  nombre: string;
  documento: number;
  jornada: string;
  grado: string;
  correo: string;
}

@Component({
  selector: 'app-lista-docentes',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, RouterLink],
  templateUrl: './lista-docentes.component.html',
  styleUrl: './lista-docentes.component.scss',
})
export default class ListaDocentesComponent {
  private _authState = inject(AuthStateService);
  private _router = inject(Router);
  private _firestore = inject(Firestore);
  Math = Math;

  nuevoDocente: Docente = {
    nombre: '',
    documento: 0,
    jornada: '',
    grado: '',
    correo: '',
  };
  async logOut() {
    await this._authState.logOut();
    this._router.navigateByUrl('/auth/sign-in');
  }

  docentes: any[] = [];
  searchTerm: string = '';

  docenteSeleccionado: Docente | null = null;

  page: number = 1;
  pageSize: number = 8;

  constructor() {
    this.obtenerDocentes();
  }

  async obtenerDocentes() {
    try {
      const docentesRef = collection(this._firestore, 'Docentes');
      const querySnapshot = await getDocs(docentesRef);

      this.docentes = [];
      let counter = 1;
      querySnapshot.forEach((doc) => {
        this.docentes.push({
          id: doc.id,
          numero: counter++, // Agregamos el número secuencial
          ...doc.data(),
        });
      });
    } catch (error) {
      console.error('Error al obtener docentes:', error);
    }
  }

  async agregarDocente() {
    try {
      const docenteData = {
        nombre: this.nuevoDocente.nombre,
        documento: this.nuevoDocente.documento,
        jornada: this.nuevoDocente.jornada,
        grado: this.nuevoDocente.grado,
        correo: this.nuevoDocente.correo,
      };

      // Validar que los campos no estén vacíos
      if (
        !docenteData.nombre ||
        !docenteData.documento ||
        !docenteData.jornada ||
        !docenteData.grado ||
        !docenteData.correo
      ) {
        console.error('Todos los campos son requeridos');
        return;
      }

      const docentesRef = collection(this._firestore, 'Docentes');
      await addDoc(docentesRef, docenteData);

      // Limpiar el formulario
      this.nuevoDocente = {
        nombre: '',
        documento: 0,
        jornada: '',
        grado: '',
        correo: '',
      };

      // Actualizar lista de docentes
      await this.obtenerDocentes();

      // Cerrar modal
      const modal = document.getElementById('agregarDocenteModal');
      if (modal) {
        modal.classList.add('hidden');
      }
    } catch (error) {
      console.error('Error al agregar docente:', error);
    }
  }

  abrirModalAgregar() {
    const modal = document.getElementById('agregarDocenteModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  cerrarModalAgregar() {
    const modal = document.getElementById('agregarDocenteModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  filtrarDocentes() {
    if (this.searchTerm) {
      this.docentes = this.docentes.filter((docente) =>
        docente.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.obtenerDocentes();
    }
  }

  async eliminarDocente(id: string) {
    try {
      const docenteRef = doc(this._firestore, 'Docentes', id);
      await deleteDoc(docenteRef);
      await this.obtenerDocentes();
    } catch (error) {
      console.error('Error al eliminar docente:', error);
    }
  }

  abrirModalEditar(docente: Docente) {
    this.docenteSeleccionado = { ...docente };
    const modal = document.getElementById('editarDocenteModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }
  async editarDocente() {
    try {
      if (!this.docenteSeleccionado?.id) {
        console.error('ID de docente no encontrado');
        return;
      }

      const docenteRef = doc(
        this._firestore,
        'Docentes',
        this.docenteSeleccionado.id
      );
      await updateDoc(docenteRef, {
        nombre: this.docenteSeleccionado.nombre,
        documento: this.docenteSeleccionado.documento,
        jornada: this.docenteSeleccionado.jornada,
        grado: this.docenteSeleccionado.grado,
        correo: this.docenteSeleccionado.correo,
      });

      // Actualizar lista de docentes
      await this.obtenerDocentes();

      // Cerrar modal
      const modal = document.getElementById('editarDocenteModal');
      if (modal) {
        modal.classList.add('hidden');
      }
    } catch (error) {
      console.error('Error al editar docente:', error);
    }
  }

  confirmarEliminar(id: string) {
    toast.warning('¿Está seguro que desea eliminar este docente?', {
      action: {
        label: 'confirmar',
        onClick: async () => {
          await this.eliminarDocente(id); // Llama a eliminarDocente si se confirma
        },
      },
      cancel: {
        label: 'cancelar',
        onClick: () => {
          toast.info('Eliminación cancelada'); // Acción al cancelar
        },
      },
    });
  }

  
}
