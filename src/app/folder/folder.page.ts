import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';

import { FirebaseService } from '../services/firebase.service';
import { User, getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
})


export class FolderPage implements OnInit {

  formReg: FormGroup = this.fb.group({
    email: new FormControl(),
    password: new FormControl()
  }
  )
  presentToast: any;


  constructor(private fb: FormBuilder,
    private firebase: FirebaseService,
    private navCtrl: NavController,
    private toastController: ToastController,
    private route: ActivatedRoute
  ) {
    const auth = getAuth();
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        user.email;
        this.firebase.recuperarAlumno(user.email!).then(
          (alumno)=>{
            console.log(alumno.avatar,alumno.nombre)
            this.navCtrl.navigateForward('/clases');
          }
        )
        console.log(user,'Ya esta iniciado')

        // Hay una sesión iniciada, redirecciona al usuario a la página principal

      } else {
        // No hay sesión iniciada, el usuario debe iniciar sesión
        // Puedes mostrar la pantalla de inicio de sesión o realizar otras acciones
      }
    });


  }


  ngOnInit() { }

  onSubmit() {

    this.firebase.iniciarSesion(this.formReg.value.email, this.formReg.value.password);
    this.formReg.reset();
  }
  provicional(){
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // La sesión se cerró exitosamente
        // this.navCtrl.navigateRoot('/inicio');
        console.log('Se cerro la sesion ');

      })
      .catch((error) => {
        // Ocurrió un error al cerrar la sesión
        console.error('Error al cerrar sesión:', error);
      });
  }

}










