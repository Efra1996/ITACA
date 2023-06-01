import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, NavParams, PopoverController, ToastController } from '@ionic/angular';
import { ComponetsModule } from 'src/app/componets/componets.module';
import { PhotoService } from 'src/app/services/photo.service';
import { ActivatedRoute } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Clase } from 'src/app/interfaces/interfaces';
import { NgModule } from '@angular/core';
import { StringifyOptions } from 'querystring';

@Component({
  selector: 'app-clases',
  templateUrl: './clases.page.html',
  styleUrls: ['./clases.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ComponetsModule, ReactiveFormsModule],
  providers: [DatePipe]
})
export class ClasesPage implements OnInit {
  esProfe! : boolean;
  clases: Clase[] = [];
  date!: string;
  hora!: string;
  cambiaFecha!: string;
  alumnosApuntados: string[] = [];
  alumnoActual: any;
  fechaSeleccionada!: string;
  alumnoAvatar: string = '';
  hourValues = ['10', '12', '17', '18', '19'];
  minuteValues = ['00', '30', '15', '45'];
  tituloClase: string = '';
  estaApuntado: boolean;
  isModalOpen = false;
  isModalBorrar = false;
  nombreClaseBorrar: string = '';
  dateTimeValue!: string;
  dateTimeLocale: string = 'es-ES';
  auth = getAuth();
  user = this.auth.currentUser;
  //formulario nueva clase
  formReg: FormGroup = this.fb.group({
    titulo: new FormControl('', Validators.required),
    fecha: new FormControl('', Validators.required),
    hora: new FormControl('', Validators.required),
  }
  )
  constructor(private foto: PhotoService,
    private firebase: FirebaseService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private toastController: ToastController,
    public popoverController: PopoverController) {
    if (this.user) {
      this.firebase.recuperarAlumno(this.user.email!).then(
        (alumno) => {
          this.alumnoActual = alumno
          this.esProfe=alumno?.profesor;
          this.foto.descargarAvatar(alumno.avatar).then(
            (resp) => {
              this.alumnoAvatar = resp
            })
          console.log(this.alumnoActual)
        }
      )
    }
    this.estaApuntado = false;
  }
  ngOnInit() {
    this.estaApuntado = true;
    this.fechaSeleccionada = this.datePipe.transform(new Date(), 'dd/MM/YYYY')!
    this.claseSeleccionada();
  }
  async nuevaReserva(hora: number, item: Clase) {
    this.estaApuntado = true;

    if (item.apuntado === false) {
      if (this.user) {

        await this.firebase.apuntarAlumno(this.fechaSeleccionada, hora.toString(), this.alumnoActual.nombre + '-' + this.alumnoActual.avatar)
          .catch(
            (error) => {
              console.log(error);
            }
          );
        await this.claseSeleccionada();
      }
    } else {
      if (this.user) {
        await this.firebase.borrarAlumno(this.fechaSeleccionada, hora.toString(), this.alumnoActual.nombre + '-' + this.alumnoActual.avatar)
        await this.claseSeleccionada();
      }
    }
  }
  onDateTimeChange(event: any) {
    this.estaApuntado = true;
    this.clases = [];
    this.dateTimeValue = event.detail.value;
    const fecha = this.datePipe.transform(event.detail.value, 'dd/MM/yyyy');
    this.fechaSeleccionada = fecha!;
    console.log('Fecha y hora seleccionadas:', fecha);
    this.claseSeleccionada();
  }
  async claseSeleccionada() {
    this.clases = [];
    let nombreAlumnos : string[] =[]
    await this.firebase.recuperarClasesDia(this.fechaSeleccionada).then((clases) => {
      let promesas = clases.map(({ alumno }) => { // Primero descargar el avatar de los alumnos
        return Promise.all(
          alumno.map((datos: string) => {
            const separaAvatar = datos.split('-');
            // nombreAlumnos.push(separaAvatar[0])
            return this.foto.descargarAvatar(separaAvatar[1]).catch((error) => {
              console.log(error);
              return null;
            });
          })
        ).then((avatares) => {
          alumno.forEach((_: any, i: number) => {
            alumno[i] = avatares[i] || this.alumnoAvatar; // Asignarle el url del avatar
          });
          // this.alumnosApuntados=nombreAlumnos
        });
      });
      Promise.all(promesas).then(() => { // Ordenar Clases
        clases.sort((a, b) => {
          const horaA = new Date(`01/01/2000 ${a.hora}`).getHours();
          const horaB = new Date(`01/01/2000 ${b.hora}`).getHours();
          return horaA - horaB;
        });
        clases.map((clases: Clase) => { // Comprobar si el alumno esta apuntado
          let apuntado = false;
          let finalizada = false
          clases.alumno.map((alum) => {
            if (alum === this.alumnoAvatar) {
              apuntado = true
            }
          })// COMPROBAR SI LA CLASE ESTA YA FINALIZADA
          let fechaClase = new Date(`${clases.fecha.slice(6)}-${clases.fecha.slice(3, 5)}-${clases.fecha.slice(0, 2)}`);
          if (fechaClase.getMonth() < new Date().getMonth()) {
              finalizada = true;
          }else if( fechaClase.getMonth() === new Date().getMonth() &&fechaClase.getDate() < new Date().getDate()){
            finalizada = true;


          } else if (fechaClase.getDate() === new Date().getDate()) {
            const horaClase = parseInt(clases.hora.split(':')[0]);
            const minutosClase = parseInt(clases.hora.split(':')[1]);
            const horaActual = new Date().getHours();
            const minutosActuales = new Date().getMinutes();

            if (horaClase < horaActual || (horaClase === horaActual && minutosClase < minutosActuales)) {
              finalizada = true;
            }
          }
          //Añadir la clase al array a mostrar con las comprobaciones ya echas
          const nuevaClase: Clase = {
            titulo: clases.titulo,
            fecha: clases.fecha,
            hora: clases.hora,
            alumno: clases.alumno,
            apuntado: apuntado,
            finalizada: finalizada,
            // nombreAlumnos: nombreAlumnos.slice(index * clases.alumno.length, (index + 1) * clases.alumno.length)
          }
          this.clases.push(nuevaClase)
        })
      });
      this.estaApuntado = false;
      // console.log(nombreAlumnos)
    });

  }
  restarDia() {
    this.estaApuntado = true;
    let fecha = new Date(
      parseInt(this.fechaSeleccionada.slice(6, 10)),  // Año
      parseInt(this.fechaSeleccionada.slice(3, 5)) - 1,  // Mes (restar 1 porque los meses en JavaScript son base 0)
      parseInt(this.fechaSeleccionada.slice(0, 2))  // Día
    );

    // Restar un día
    fecha.setDate(fecha.getDate() - 1);
    let fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
    console.log(fechaFormateada)
    const [dia, mes, anio] = fechaFormateada.split('/');
    const fechaISO8601 = `${anio}-${mes}-${dia}`;
    this.cambiaFecha = fechaISO8601;
    this.fechaSeleccionada = fechaFormateada;
    this.claseSeleccionada()
  }
  sumarDia() {
    this.estaApuntado = true;
    let fecha = new Date(
      parseInt(this.fechaSeleccionada.slice(6, 10)),  // Año
      parseInt(this.fechaSeleccionada.slice(3, 5)) - 1,  // Mes (restar 1 porque los meses en JavaScript son base 0)
      parseInt(this.fechaSeleccionada.slice(0, 2))  // Día
    );

    // Restar un día
    fecha.setDate(fecha.getDate() + 1);

    // Formatear la fecha como una cadena en el formato dd/MM/yyyy
    let fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;

    // this.fechaSeleccionada=this.datePipe.transform( fechaResta.getDate()-1, 'dd/MM/yyyy')!;
    console.log(fechaFormateada)
    const [dia, mes, anio] = fechaFormateada.split('/');
    const fechaISO8601 = `${anio}-${mes}-${dia}`;
    this.cambiaFecha = fechaISO8601;
    this.fechaSeleccionada = fechaFormateada;
    this.claseSeleccionada()

  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if(!isOpen){
      this.claseSeleccionada()
    }
  }
  setBorrar(isOpen: boolean) {
    this.isModalBorrar = isOpen;
    if (!isOpen) {
      this.claseSeleccionada()
    }
  }
  crearNuevaClase() {
    const horaCompleta = this.formReg.controls['hora'].value
    const hora = this.datePipe.transform(horaCompleta, 'HH:mm')!;
    const fechasCompletas = this.formReg.controls['fecha'].value;
    const titulo = this.formReg.controls['titulo'].value;
    const alumnos: string[] = [];
    let fechas: string[] = [];
    fechasCompletas.map((fecha: any) => {
      fechas.push(this.datePipe.transform(fecha, 'dd/MM/yyyy')!)
    })

    this.firebase.subirNuevaClase(fechas, hora, alumnos, titulo)
      .then((_) => {
        this.presentToast('Nueva clase de ' + titulo + ' creada!');
        this.formReg.reset();
      });


  }
  async presentToast(mensaje: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000 // duración en milisegundos
    });
    toast.present();
  }

  buscarClaseBorrar(event2: any) {
    const fecha = this.datePipe.transform(event2.detail.value, 'dd/MM/yyyy');
    this.fechaSeleccionada = fecha!;
    console.log('Fecha y hora seleccionadas:', fecha);
    this.firebase.recuperarClasesDia(this.fechaSeleccionada).then((clases) => {
      console.log(clases);
      this.clases = clases;
    });
  }
  borrarClase(clase: Clase) {
    this.firebase.borrarClase(clase.fecha, clase.hora)
      .then(() => {
        this.firebase.recuperarClasesDia(this.fechaSeleccionada).then((clases) => {
          this.clases = clases;
        });
        this.presentToast('¡Clase de ' + clase.titulo + ' borrada!');
      }).catch(
        (error) => {
          console.log(error)
        }
      )
  }

}
