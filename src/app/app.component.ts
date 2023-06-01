import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponetsModule } from './componets/componets.module';
import { DataService } from './services/data.service';
import { PhotoService } from './services/photo.service';
import { getAuth } from 'firebase/auth';
import { FirebaseService } from './services/firebase.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive, CommonModule, ComponetsModule],
})
export class AppComponent {
  frasesRandom : string[]=[
    '¡Siempre se entrena!',
    'Hacer excusas, quema 0 calorias.',
    'En los días buenos, entrena. En los días malos, entrena más duro.',
    'Recuerda: Una mano en el suelo, es una mano rota.',
    '¡Solo pueden comer pastelitos los que hacen todos los cambios!',
    'Comer, Dormir, Gym, Repetir.',
    'Todo el progreso tiene lugar fuera de la zona de confort',
    'Si quieres ser un Tiburón, debes entrenar con los Tiburones',
    'Aprender es la clave del progreso, La ignorancia es la limitación, la sabiduría es la libertad',
    'Las medallas se ganan en el gimnasio, en día de la competición es cuando se recogen'
  ];
  fraseMuestra! : string;
  esProfe! : boolean;
  avatar!: string;
  nombre!: string;
  verificado : boolean =  true; //true para desactivar menu
  public appPages = [

    { title: 'Clases', url: '/clases', icon: 'calendar' },
    { title: 'Eventos', url: '/eventos', icon: 'trophy' },
    { title: 'Pagos', url: '/pagos', icon: 'cash' },
    { title: 'Perfil', url: '/perfil', icon: 'person' },
    { title: 'Entrenamientos', url: '/entrenamiento', icon: 'barbell' },
    { title: 'Alumnos', url: '/alumnos', icon: 'people' },
    { title: 'Salir', url: '/folder', icon: 'exit' },
  ];
  constructor(private data: DataService,
    private photoService: PhotoService,
    private firebase: FirebaseService) {

      this.cargarDatos();
      const indiceAleatorio = Math.floor(Math.random() * 10);
      this.fraseMuestra=this.frasesRandom[indiceAleatorio]
    }

  ngOnInit() {
  }
  cargarDatos(){
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.verificado=false;// false para habilitar menu
      this.firebase.recuperarAlumno(user.email!).then(
        (alumno) => {
          this.nombre=alumno.nombre+' '+alumno.apellidos;
          this.esProfe=alumno?.profesor;
          this.photoService.descargarAvatar(alumno.avatar).then(
            (resp) => {
              this.avatar = resp;

            }

          ).catch(
            (_) => {

            }

          )
        }
      )

    }
  }

}
