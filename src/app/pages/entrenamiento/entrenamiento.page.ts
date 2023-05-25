import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, PopoverController, ToastController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { PhotoService } from 'src/app/services/photo.service';
import { ComponetsModule } from 'src/app/componets/componets.module';
import { Entrenamiento } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-entrenamiento',
  templateUrl: './entrenamiento.page.html',
  styleUrls: ['./entrenamiento.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ComponetsModule, ReactiveFormsModule],
  providers: [DatePipe]

})
export class EntrenamientoPage implements OnInit {
  filtro: string;
  filtro2: string;

  semanal = false;
  libre = false;
  gym = false;
  intervalos = false;
  crear = false;
  borrar = false;
  entrenoSemanal!: Entrenamiento[];
  entrenoLibre!: Entrenamiento[];
  entrenoGym!: Entrenamiento[];
  entrenoIntervalos!: Entrenamiento[];
  allEntrenos : Entrenamiento[]=[]
  entrenoBusqueda : string ='';

  //Formulario
  formReg: FormGroup = this.fb.group({
    tipo: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    series: new FormControl('', Validators.required),
    repeticiones: new FormControl(''),
  }
  )
  ejercicioCounter = 0;
  constructor(private foto: PhotoService,
    private firebase: FirebaseService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private toastController: ToastController,
    public popoverController: PopoverController) {
    this.filtro = 'especificos';
    this.filtro2 = 'todo';

  }

  ngOnInit() {
  }
  abrir() {
    console.log('abrir')
  }
  cambiaFiltro(event: any) {
    console.log(event.detail.value)
    this.filtro = event.detail.value;

  }
  cambiaFiltro2(event: any) {
    console.log(event.detail.value)
    this.filtro2 = event.detail.value;

  }


  abrirCrear(abrir: boolean) {
    this.crear = abrir;

  }
  abrirBorrar(abrir: boolean) {
    this.borrar = abrir;
    if(abrir===true){
      this.firebase.getAllEntrenos().then((entrenos)=>{
        this.allEntrenos = entrenos;
      })
    }
  }
  abrirSemanal(abrir: boolean) {
    this.semanal = abrir;
    this.firebase.recuperarEntrenamientoTipo('semanal').then((rutinas) => {
      this.entrenoSemanal = rutinas
    });
    console.log(this.entrenoSemanal)

  }
  abrirLibre(abrir: boolean) {
    this.libre = abrir;
    this.firebase.recuperarEntrenamientoTipo('libre').then((rutinas) => {
      console.log(rutinas)
      this.entrenoLibre = rutinas
    });
    console.log(this.entrenoLibre)
  }
  abrirGym(abrir: boolean) {
    this.gym = abrir;
    this.firebase.recuperarEntrenamientoTipo('gimnasio').then((rutinas) => {
      console.log(rutinas)
      this.entrenoGym = rutinas
    });
  }
  abrirIntervalos(abrir: boolean) {
    this.intervalos = abrir;
    this.firebase.recuperarEntrenamientoTipo('intervalos').then((rutinas) => {
      this.entrenoIntervalos = rutinas
    });
    console.log(this.entrenoIntervalos)
  }
  async onSubmit() {
    const valoresInputs = [];
    for (let i = 1; i <= this.ejercicioCounter; i++) {
      const inputId = `ejercicio-${i}`;
      const inputElement = document.getElementById(inputId) as HTMLInputElement;
      const valorInput = inputElement.value;
      valoresInputs.push(valorInput);
    }
    const ejercicios: string[] = valoresInputs;
    const series: number = this.formReg.value.series;
    const repeticiones = this.formReg.value.repeticiones ? this.formReg.value.repeticiones : 0

    await this.firebase.subirNuevoEntreno(
      this.formReg.value.tipo,
      this.formReg.value.nombre,
      ejercicios,
      series,
      repeticiones
    ).then(

      (resp) => {
        this.formReg.reset();

        for (let i = 1; i <= this.ejercicioCounter; i++) {
          const inputId = `ejercicio-${i}`;
          const contenedor = document.getElementById('ejercicios-container')!;
          const inputElement = document.getElementById(inputId);
          if (inputElement) {
            contenedor.removeChild(inputElement);
          }
        }
        this.presentToast('¡Nuevo entrenamiento creado!');
        this.ejercicioCounter = 0;

        console.log('Se ha creado');
      }
    ).catch(
      (resp) => {
        console.log('NO Se ha creado');
      }
    );


  }
  campoEsValido(campo: string) {
    return (
      this.formReg.controls[campo].errors &&
      this.formReg.controls[campo].touched
    );
  }


  agregarEjercicio() {
    this.ejercicioCounter++;
    const nuevoCampo = `<ion-input name="ejercicio-${this.ejercicioCounter}" id="ejercicio-${this.ejercicioCounter}"  placeholder="Ejercicio ${this.ejercicioCounter}"></ion-input>`;
    const contenedor = document.getElementById('ejercicios-container')!;
    contenedor.insertAdjacentHTML('beforeend', nuevoCampo);
  }

  async presentToast(mensaje: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000 // duración en milisegundos
    });
    toast.present();
  }
  borrarEntreno(entreno : Entrenamiento){
    this.firebase.borrarEntreno(entreno.nombre, entreno.tipo)
    .then(() => {
      this.allEntrenos=[];
      this.presentToast('¡Entrenamiento de ' + entreno.nombre + ' borrado!');
      this.firebase.getAllEntrenos().then((entrenos)=>{
        this.allEntrenos = entrenos;
      })
      
    }).catch(
      (error) => {
        console.log(error)
      }
    )
  }
  buscarEntrenoBorrar(event : any){
    console.log(event.detail.value)
    const tipo = event.detail.value;
    if(tipo!=='all'){
      this.firebase.recuperarEntrenamientoTipo(tipo).then((entrenos)=>{
        this.allEntrenos=[];
        this.allEntrenos=entrenos;
      })

    }else{
      this.getAllEntrenos();
    }

  }
  buscarEntrenoBorrarNombre(event : any){
    const titleCaseString = toTitleCase(event.detail.value);
    const nombre : string = titleCaseString;
    console.log(nombre)
    if(nombre.length>0){
      this.firebase.recuperarEntrenamientoNombre(nombre).then((entrenos)=>{
        this.allEntrenos=[];
        this.allEntrenos=entrenos;
      })
    }else{
      this.getAllEntrenos();
    }

  }
  getAllEntrenos(){
    this.allEntrenos=[];
    this.firebase.getAllEntrenos().then((entrenos)=>{
      this.allEntrenos = entrenos;
    })

  }

  

}
function toTitleCase(str : string) {
  return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
    return match.toUpperCase();
  });
}
