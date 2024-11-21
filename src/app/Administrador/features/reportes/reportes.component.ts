import { Component, inject } from '@angular/core';
import { AuthStateService } from '../../../shared/data-access/auth-state.service';
import { Router } from '@angular/router';
import { collection, getDocs, Firestore } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'ngx-sonner';
import { NotificationService } from '../../notificationService/notification.service'
import * as cron from 'node-cron';


@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export default class ReportesComponent {
  private _authState = inject(AuthStateService);
  private _router = inject(Router);
  private _firestore = inject(Firestore);
  private _notificationService = inject(NotificationService);

  reportes: any[] = [];
  page: number = 1;
  pageSize: number = 10;
  Math = Math;
  searchTerm: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  reportesOriginales: any[] = [];
  reportesProcesados: any[] = [];
  docentes: any[] = [];

  constructor() {
    this.obtenerAsistencias(); 
    // this.programarEnvioNotificaciones(); //Aún no hay servicio para eso entonces  no se usa
  }

  ngOnInit() {
    this.cargarDocentes();
    this.cargarReportes();
  }

  //notificcioón por correo
  private programarEnvioNotificaciones() {
    
    // Enviar notificaciones cada domingo a las 23:59
    cron.schedule('59 23 * * 0', () => {
      this.enviarNotificacionesSemanal();
    });

    // Enviar notificaciones el último día del mes a las 23:59
    cron.schedule('59 23 28-31 * *', () => {
      const today = new Date();
      if (today.getDate() === new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()) {
        this.enviarNotificacionesMensual();
      }
    });
  }


  private async enviarNotificacionesSemanal() {
    this.docentes.forEach((docente) => {
      const mensaje = `Hola ${docente.nombre},\n\nAquí está tu informe de asistencias de la semana.`;
      const datosReporte = this.reportes.map((reporte, index) => {
        const fechaTimestamp = reporte.fecha;
        const horaEntrada = reporte.horaEntrada;
        const horaSalida = reporte.horaSalida;
        const entrada = horaEntrada && horaEntrada !== null;
        const salida = horaSalida && horaSalida !== null;
        const horasLaboradas = entrada && salida 
          ? this.calcularHorasLaboradas(horaEntrada, horaSalida) 
          : null;

        const estado = horasLaboradas && this.convertirHorasAHorasDecimal(horasLaboradas) >= 6
          ? 'Completo' 
          : 'Incompleto';
        return {
          indice: index + 1,
          nombre: reporte.nombre,
          documento: reporte.documento,
          fecha: fechaTimestamp,  // fecha del día para mostrar y ordenar
          horaEntrada: horaEntrada,
          horaSalida: horaSalida, // Se permite que sea null si no hay salida
          horasLaboradas: horasLaboradas, // Se calcula solo si hay entrada y salida válidas
          estado: estado, // Se agrega el estado
        };
      });

      // Crear el libro de trabajo y la hoja
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datosReporte);
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

      // Generar el archivo XLSX
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const archivoXLSX = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const archivoXLSXFile = new File([archivoXLSX], 'reporte_asistencias_semanal.xlsx'); // Crear un archivo a partir del Blob

      // Enviar el archivo XLSX
      this._notificationService.enviarNotificacion(docente.email, mensaje, archivoXLSXFile).subscribe();
    });
  }

  private async enviarNotificacionesMensual() {
    this.docentes.forEach((docente) => {
      const mensaje = `Hola ${docente.nombre},\n\nAquí está tu informe de asistencias del mes.`;
      const datosReporte = this.reportes.map((reporte, index) => {
        const fechaTimestamp = reporte.fecha;
        const horaEntrada = reporte.horaEntrada;
        const horaSalida = reporte.horaSalida;
        const entrada = horaEntrada && horaEntrada !== null;
        const salida = horaSalida && horaSalida !== null;
        const horasLaboradas = entrada && salida 
          ? this.calcularHorasLaboradas(horaEntrada, horaSalida) 
          : null;

        const estado = horasLaboradas && this.convertirHorasAHorasDecimal(horasLaboradas) >= 6
          ? 'Completo' 
          : 'Incompleto';
        return {
          indice: index + 1,
          nombre: reporte.nombre,
          documento: reporte.documento,
          fecha: fechaTimestamp,  // fecha del día para mostrar y ordenar
          horaEntrada: horaEntrada,
          horaSalida: horaSalida, // Se permite que sea null si no hay salida
          horasLaboradas: horasLaboradas, // Se calcula solo si hay entrada y salida válidas
          estado: estado, // Se agrega el estado
        };
      });

      // Crear el libro de trabajo y la hoja
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datosReporte);
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

      // Generar el archivo XLSX
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const archivoXLSX = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const archivoXLSXFile = new File([archivoXLSX], 'reporte_asistencias_mensual.xlsx'); // Crear un archivo a partir del Blob

      // Enviar el archivo XLSX
      this._notificationService.enviarNotificacion(docente.email, mensaje, archivoXLSXFile).subscribe();
    });
  }

    async cargarDocentes() {
    try {
      const docentesRef = collection(this._firestore, 'Docentes');
      const docentesSnapshot = await getDocs(docentesRef);
      this.docentes = docentesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al cargar docentes:', error);
    }
  }

  async cargarReportes() {
    try {
      const reportesRef = collection(this._firestore, 'Asistencias');
      const reportesSnapshot = await getDocs(reportesRef);
      
      const registrosPorDocenteYFecha = new Map();
      
      reportesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const documento = data['documentoDocente'];
        const fechaTimestamp = data['fecha'];
        const horaEntrada = data['horaEntrada'];
        const horaSalida = data['horaSalida'];
        const nombre = data['nombreDocente'];
        const entrada = data['entrada'];
        const salida = data['salida'];
        
        const key = `${documento}_${fechaTimestamp.toDate().toDateString()}`;
        
        if (!registrosPorDocenteYFecha.has(key)) {
          const horasLaboradas = entrada && salida 
            ? this.calcularHorasLaboradas(horaEntrada, horaSalida) 
            : null;

          const estado = horasLaboradas && this.convertirHorasAHorasDecimal(horasLaboradas) < 6 
            ? 'Incompleto' 
            : 'Completo';

          registrosPorDocenteYFecha.set(key, {
            documento: documento,
            nombre: nombre,
            fecha: fechaTimestamp,  // fecha del día para mostrar y ordenar
            horaEntrada: horaEntrada,
            horaSalida: horaSalida, // Se permite que sea null si no hay salida
            horasLaboradas: horasLaboradas, // Se calcula solo si hay entrada y salida válidas
            estado: estado, // Se agrega el estado
          });
        }
        
      });

      this.reportes = Array.from(registrosPorDocenteYFecha.values())
        .sort((a, b) => {
          if (a.documento !== b.documento) {
            return a.documento.localeCompare(b.documento);
          }
          return a.fecha.toDate() - b.fecha.toDate();
        });

      this.reportesProcesados = [...this.reportes];
      this.reportesOriginales = [...this.reportes];
    } catch (error) {
      toast.error(`Error al cargar reportes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private calcularHorasLaboradas(horaEntrada: string, horaSalida: string): string {
    const [hE, mE, sE] = horaEntrada.split(':').map(Number);
    const [hS, mS, sS] = horaSalida.split(':').map(Number);

    const entrada = new Date();
    entrada.setHours(hE, mE, sE);

    const salida = new Date();
    salida.setHours(hS, mS, sS);

    const diferencia = salida.getTime() - entrada.getTime();
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas} horas y ${minutos} minutos`;
  }

  private convertirHorasAHorasDecimal(horas: string): number {
    const [horasLaboradas, minutosLaborados] = horas.split(' horas y ').map(part => parseInt(part));
    return horasLaboradas + (minutosLaborados / 60);
  }

  filtrarReportes(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    if (searchTerm) {
      this.reportes = this.reportes.filter((reporte) =>
        reporte.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // Si no hay término de búsqueda, recargar todos los reportes
      this.obtenerAsistencias();
    }
  }

  filtrarPorFechas(event: any) {
    if (!this.fechaInicio && !this.fechaFin) {
      // Si no hay fechas seleccionadas, mostrar todos los reportes
      this.reportes = [...this.reportesOriginales];
      return;
    }

    this.reportes = this.reportesOriginales.filter((reporte) => {
      const fechaReporte = reporte.fecha?.toDate();
      if (!fechaReporte) return false;

      // Convertir fechas a objetos Date
      const inicio = this.fechaInicio ? new Date(this.fechaInicio) : null;
      const fin = this.fechaFin ? new Date(this.fechaFin) : null;

      // Ajustar la hora de las fechas para comparación correcta
      if (inicio) inicio.setHours(0,0,0,0);
      if (fin) fin.setHours(23,59,59,999);
      
      // Validar que la fecha del reporte esté en el rango
      const cumpleInicio = !inicio || fechaReporte >= inicio;
      const cumpleFin = !fin || fechaReporte <= fin;

      return cumpleInicio && cumpleFin;
    });
  }

  async logOut() {
    await this._authState.logOut();
    this._router.navigateByUrl('/auth/sign-in');
  }

  async obtenerAsistencias() {
    try {
      const asistenciasRef = collection(this._firestore, 'Asistencias');
      const asistenciasSnapshot = await getDocs(asistenciasRef);

      this.reportes = [];
      let counter = 1;
      asistenciasSnapshot.forEach((doc) => {
        this.reportes.push({
          id: doc.id,
          numero: counter++,
          ...doc.data(),
        });
      });
    } catch (error) {
      console.error('Error al obtener asistencias:', error);
    }
  }

  descargarReporte() {
    // Preparar los datos para el reporte
    const datosReporte = this.reportes.map((reporte, index) => ({
      Número: index + 1,
      nombre: reporte.nombre,
      documento: reporte.documento,
      fecha: reporte.fecha?.toDate().toLocaleDateString(),
      horaEntrada: reporte.horaEntrada,
      horaSalida: reporte.horaSalida,
      horasLaboradas: reporte.horasLaboradas,
      estado: reporte.estado
    }));

    // Crear el libro de trabajo y la hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosReporte);

    // Determinar el rango de fechas para el nombre del archivo
    let rangoFechas = 'desde el inicio de los tiempos';
    if (this.fechaInicio && this.fechaFin) {
      rangoFechas = `del ${new Date(this.fechaInicio).toLocaleDateString()} al ${new Date(this.fechaFin).toLocaleDateString()}`;
    } else if (this.fechaInicio) {
      rangoFechas = `desde ${new Date(this.fechaInicio).toLocaleDateString()}`;
    } else if (this.fechaFin) {
      rangoFechas = `hasta ${new Date(this.fechaFin).toLocaleDateString()}`;
    } else {
      // Si no hay filtros de fechas, agregar marca de tiempo
      const marcaTiempo = new Date().toLocaleString();
      rangoFechas += ` - ${marcaTiempo}`;
    }

    // Determinar si hay filtro de docente
    let filtroDocente = 'reporte de todos los docentes';
    if (this.searchTerm?.trim()) {
      filtroDocente = `reporte para ${this.searchTerm}`;
    }

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Asistencias');

    // Generar el archivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Descargar el archivo con el nombre personalizado
    saveAs(data, `reporte_asistencias_${filtroDocente}_${rangoFechas}.xlsx`);
  }
}
