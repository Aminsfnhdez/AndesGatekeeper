import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getDocs } from '@angular/fire/firestore';
import { collection, query, Firestore, where } from '@angular/fire/firestore';
import { toast } from 'ngx-sonner';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

export interface Asistencia {
    documento: number;
    nombre: string;
    tipoRegistro: 'entrada' | 'salida';
    fecha: Date;
}

interface Docente {
  nombre: string;
  documento: Number;
  // ... otros campos necesarios
}

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  providers: [],
  templateUrl: './asistencias.component.html',
  styleUrl: './asistencias.component.scss',
})
export default class AsistenciasComponent {
  documentoInput: string = '';
  nombreDocente: string = '';
  tipoRegistro: 'entrada' | 'salida' | null = null;
  fechaActual: Date = new Date();
  docentesSugeridos: Docente[] = [];

  constructor(private firestore: Firestore) {}

  async buscarDocente() {
    if (this.documentoInput) {
      const docenteRef = collection(this.firestore, 'Docentes');
      const q = query(
        docenteRef,
        where('documento', '==', this.documentoInput)
      );

      try {
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docente = querySnapshot.docs[0].data();
          this.nombreDocente = docente['nombre'];
        } else {
          this.nombreDocente = '';
          /* toast.error(
            'Docente no encontrado. Por favor contacte al administrador del sitio.'
          ); */
        }
      } catch (error) {
        console.error('Error al buscar docente:', error);
        toast.error('Error al buscar docente. Por favor intente nuevamente.');
      }
    }
  }

  seleccionarDocente(docente: any) {
    this.documentoInput = docente.documento;
    this.nombreDocente = docente.nombre;
    this.docentesSugeridos = [];
  }
}
