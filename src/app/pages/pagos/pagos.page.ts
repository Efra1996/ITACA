import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, PopoverController, ToastController } from '@ionic/angular';
import { Alumno, Pago } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { PhotoService } from 'src/app/services/photo.service';
import { ComponetsModule } from 'src/app/componets/componets.module';
import { getAuth } from 'firebase/auth';
import { async } from 'rxjs';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ComponetsModule, ReactiveFormsModule],
  providers: [DatePipe]
})
export class PagosPage implements OnInit {
  esProfe! : boolean;
  alumnos! : any ;
  isModalOpen = false;
  isModalBorrar = false;
  pagos : Pago[]=[]
date : string='';
formReg: FormGroup = this.fb.group({
  nombre: new FormControl('', Validators.required),
  apellidos: new FormControl('',Validators.required ),
  tarifa: new FormControl('', Validators.required),
  fechaPago :new FormControl('', Validators.required),
  formaPago :new FormControl('', Validators.required),
  importe :new FormControl('',Validators.required)
})
auth = getAuth();
user = this.auth.currentUser;
alumnoActual: any;
alumnoAvatar: string = '';
alumnoBusqueda : string = '';
filtro:string='';
vacio:boolean=false;
cambiaFecha!: string;
cambiaFecha2!: string;

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
      this.getAllPagos();
     }

  ngOnInit() {
  }

  async setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if(!isOpen){
    }else{
      this.alumnos= await this.firebase.getAllAlumnos();
      console.log(this.alumnos)
    }
  }
  setBorrar(isOpen: boolean) {
    this.isModalBorrar = isOpen;
    if (!isOpen) {
    }
  }
  async onSubmit(){
    await this.firebase.nuevoPago(
      this.formReg.value.nombre,
      this.formReg.value.apellidos,
      this.formReg.value.tarifa,
      this.formReg.value.formaPago,
      this.formReg.value.fechaPago,
      this.formReg.value.importe,
    ).then(

      (resp) => {
        this.formReg.reset();
        // this.date=this.datePipe.transform(new Date(),'yyyy/MM/dd')!
        console.log('Se ha creado');
      }
    ).catch(
      (resp) => {
        console.log('NO Se ha creado');
      }
    );
  }
  campoEsValido(campo : string){}
  onDateTimeChange(event : any){
    let fecha = this.datePipe.transform(event.detail.value,'yyyy/MM/dd')!;
    this.formReg.controls['fechaPago'].setValue(fecha);
  }

  buscarEventoBorrar(event : any){}
  borrarPago(pago : Pago){
    this.firebase.borrarPago(pago.fecha, pago.alumno)
    .then(() => {
      this.presentToast('¡Pago de ' + pago.alumno + ' borrado!');
      this.getAllPagos();
    }).catch(
      (error) => {
        console.log(error)
      }
    )

  }

 async buscarAlumno(event:any){
    this.alumnoBusqueda=event.detail.value;
    console.log(this.alumnoBusqueda);
    if(this.alumnoBusqueda.length!==0){
      const datos=this.alumnoBusqueda.split(' ');
      this.pagos = [];
      const pago = await this.firebase.recuperarPagosNombre(datos[0],datos[1]);
  
      if(pago){
        pago.sort((a:any, b:any) => {
          const fechaA = new Date(a.fecha).getTime();
          const fechaB = new Date(b.fecha).getTime();
    
          return fechaA - fechaB;
        })
        console.log(pago)
        this.pagos = pago;
      }
    }else{
      this.getAllPagos()
    }




  }
  async getAllPagos() {
    this.pagos = [];
    const eventos = await this.firebase.getAllPagos();
  
    eventos.sort((a:any, b:any) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();

      return fechaA - fechaB;
    })
    console.log(eventos)
    this.pagos = eventos;
  }
  cambiaFiltro(event : any){
    console.log(event.detail.value)
    this.filtro=event.detail.value;
    if(this.filtro==='todo'){
      this.getAllPagos();
    }
  }
  async buscarAlumnoFecha(event2 : any){
    let fecha = this.datePipe.transform(event2.detail.value,'yyyy/MM/dd')!;
    console.log(fecha)
    this.pagos = [];
    const pago = await this.firebase.recuperarPagosFecha(fecha);

    if(pago){
      pago.sort((a:any, b:any) => {
        const fechaA = new Date(a.fecha).getTime();
        const fechaB = new Date(b.fecha).getTime();
  
        return fechaA - fechaB;
      })
      console.log(pago)
      this.pagos = pago;
    }
  }
  alumnoSeleccionado(event : any){
    console.log(event.detail.value.apellidos)
    this.formReg.value.apellidos=event.detail.value.apellidos;
    this.formReg.controls['nombre'].setValue(event.detail.value.nombre);
    this.formReg.controls['apellidos'].setValue(event.detail.value.apellidos);
    this.formReg.controls['tarifa'].setValue(event.detail.value.tarifa);  
  
  }
  async presentToast(mensaje: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000 // duración en milisegundos
    });
    toast.present();
  }

}
