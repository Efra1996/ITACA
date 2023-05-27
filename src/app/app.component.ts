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
              console.log('Soy un pringado')
            }

          )
        }
      )

    }
  }

}
