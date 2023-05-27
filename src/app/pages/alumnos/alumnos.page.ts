import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, PopoverController, ToastController } from '@ionic/angular';
import { Alumnos } from 'src/app/interfaces/interfaces';
import { ComponetsModule } from 'src/app/componets/componets.module';
import { FirebaseService } from 'src/app/services/firebase.service';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.page.html',
  styleUrls: ['./alumnos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ComponetsModule, ReactiveFormsModule],
  providers: [DatePipe]
})
export class AlumnosPage implements OnInit {
  cargar : boolean = false;
  allAlumnos: any = []
  avatar: string = 'data:image/png;base64,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';
  modificar = false;
  alumnoModificar!: Alumnos;
  profe : boolean = false;
  formReg: FormGroup = this.fb.group({
    email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
    dni: new FormControl(),
    nombre: new FormControl('', Validators.required),
    apellidos: new FormControl('', Validators.required),
    cinturon: new FormControl('blanco'),
    grados: new FormControl(),
    peso: new FormControl(),
    telefono: new FormControl('', [Validators.required, Validators.minLength(9)]),
    tarifa: new FormControl('iniciacion', Validators.required),
    esProfe : new FormControl(),
    fecha : new FormControl(),

  })
  //Contructor
  constructor(
    private foto: PhotoService,
    private firebase: FirebaseService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private toastController: ToastController,
    public popoverController: PopoverController
  ) {
    // this.firebase.getAllAlumnos().then((alumnos )=>{
    //   this.allAlumnos=alumnos;
    //   console.log(this.allAlumnos);

    // })
    this.recuperaTodosAlumnos()

  }

  ngOnInit() {
  }
  async presentToast(mensaje: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000 // duración en milisegundos
    });
    toast.present();
  }
  async recuperaTodosAlumnos() {
    this.cargar=true;
    this.allAlumnos = [];
    await this.firebase.getAllAlumnos().then((alumnos: Alumnos[]) => {
      let promesas = alumnos.map((alumno: Alumnos) => {
        return this.foto.descargarAvatar(alumno.avatar).catch((error) => {
          console.log(error);
          return null;
        });
      });

      return Promise.all(promesas).then((avatares) => {
        alumnos.forEach((alumno: Alumnos, i: number) => {
          alumno.avatar = avatares[i] || this.avatar;
        });
        this.allAlumnos = alumnos;
        console.log(this.allAlumnos)
        this.cargar=false;
      })


    });

  }
  abrirIntervalos(modificar: boolean, alumno?: Alumnos) {
    this.modificar = modificar;
    if (alumno) {
      this.firebase.recuperarAlumno(alumno.correo!).then((alumno) => {
        this.alumnoModificar = alumno
        console.log(this.alumnoModificar)
        this.formReg.controls['email'].setValue(this.alumnoModificar.correo);
        this.formReg.controls['nombre'].setValue(this.alumnoModificar.nombre);
        this.formReg.controls['apellidos'].setValue(this.alumnoModificar.apellidos);
        this.formReg.controls['cinturon'].setValue(this.alumnoModificar.cinturon);
        this.formReg.controls['peso'].setValue(this.alumnoModificar.peso);
        this.formReg.controls['tarifa'].setValue(this.alumnoModificar.tarifa);
        this.formReg.controls['telefono'].setValue(this.alumnoModificar.telefono); 
        this.formReg.controls['dni'].setValue(this.alumnoModificar.dni?this.alumnoModificar.dni:'26275424V' ); 
        this.formReg.controls['grados'].setValue(this.alumnoModificar.grados?this.alumnoModificar.grados : 0 ); 
        this.formReg.controls['fecha'].setValue(this.alumnoModificar.fecha?this.alumnoModificar.fecha : '2023/01/01' ); 
        // this.profe=this.alumnoModificar.esProfe? this.alumnoModificar.esProfe : false
        this.formReg.controls['esProfe'].setValue(this.alumnoModificar.profesor ?true : false);
      })
    }else if(this.modificar===false){
      this.recuperaTodosAlumnos();
    }

  }
  async onSubmit() {

      await this.firebase.actualizarAlumnoProfe(
        this.alumnoModificar.correo!,
        this.formReg.value.telefono,
        this.formReg.value.cinturon,
        this.formReg.value.peso,
        this.formReg.value.tarifa,
        this.formReg.value.dni!,
        this.formReg.value.fecha!,
        this.formReg.value.esProfe!,
        this.formReg.value.grados!,
      ).then(
        (resp) => {
          this.presentToast('Datos modificados correctamente ☺');


        }
      ).catch(
        (resp) => {
          this.presentToast('No se ha podido modificar los datos, vuelva a intentarlo más tarde');
        }
      );

    
  }
  campoEsValido(campo: string) {
    return (
      this.formReg.controls[campo].errors &&
      this.formReg.controls[campo].touched
    );
  }
  onDateTimeChange(event : any){
    let fecha = this.datePipe.transform(event.detail.value,'yyyy/MM/dd')!;
    this.formReg.controls['fecha'].setValue(fecha);
  }
}