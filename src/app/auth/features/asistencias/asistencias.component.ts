import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addDoc, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { collection, query, Firestore, where } from '@angular/fire/firestore';
import { toast } from 'ngx-sonner';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';

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

  async registrarAsistencia() {
    try {
      // Validaciones iniciales
      if (!this.documentoInput || !this.nombreDocente || !this.tipoRegistro) {
        toast.error('Por favor complete todos los campos');
        return;
      }

      const asistenciaRef = collection(this.firestore, 'Asistencias');
      const fechaActual = new Date();
      const horaActual = fechaActual.toLocaleTimeString('es-CO', {hour12:false});
      
            // Consulta para el día actual
      const inicioDia = new Date(fechaActual);
      inicioDia.setHours(0,0,0,0);
      
      const finDia = new Date(fechaActual);
      finDia.setHours(23,59,59,999);

      // Consulta más específica
      const q = query(
        asistenciaRef,
        where('documentoDocente', '==', this.documentoInput),
        where('fecha', '>=', Timestamp.fromDate(inicioDia)),
        where('fecha', '<=', Timestamp.fromDate(finDia))
      );

      const querySnapshot = await getDocs(q);

      if (this.tipoRegistro === 'entrada') {
        // Verificar si ya existe entrada
        const entradaHoy = querySnapshot.docs.find(doc => doc.data()['entrada'] === true);
        if (entradaHoy) {
          toast.error('Ya registraste tu entrada el día de hoy');
          return;
        }

        // Crear nuevo registro de entrada
        await addDoc(asistenciaRef, {
          documentoDocente: this.documentoInput,
          nombreDocente: this.nombreDocente,
          fecha: this.fechaActual,
          entrada: true,
          salida: false,
          horaEntrada: horaActual,
          horaSalida: ''
        });

        toast.success('Entrada registrada correctamente');

      } else if (this.tipoRegistro === 'salida') {
        // Buscar entrada sin salida registrada
        const entradaSinSalida = querySnapshot.docs.find(
          doc => doc.data()['entrada'] === true && doc.data()['salida'] === false
        );

        if (!entradaSinSalida) {
          toast.error('No se encontró un registro de entrada sin salida para hoy');
          return;
        }

        // Actualizar registro con la salida
        await updateDoc(doc(asistenciaRef, entradaSinSalida.id), {
          salida: true,
          horaSalida: horaActual
        });

        toast.success('Salida registrada correctamente');
      }

      // Limpiar formulario
      this.documentoInput = '';
      this.nombreDocente = '';
      this.tipoRegistro = null;

    } catch (error) {
      /* console.error('Error al registrar asistencia:', error); */
      toast.error('Error al registrar la asistencia. Por favor intente nuevamente.',{
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
