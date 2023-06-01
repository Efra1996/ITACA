import { Injectable, QueryList } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, getAuth, setPersistence, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, updateDoc, where, writeBatch } from "firebase/firestore";
import { PhotoService } from './photo.service';
import { DataService } from './data.service';
import { Clase } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  app = initializeApp(environment.firebaseConfig);
  db = getFirestore(this.app);

  constructor(private toastController: ToastController,
    private navCtrl: NavController,
  ) {
  }
  async crearNuevoUsuario(email: any, contra: any, foto: any) : Promise<any> {
    try {
      const auth = getAuth(this.app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, contra);
      this.presentToast('Usuario creado correctamente');
      const user = userCredential.user;
      return userCredential

    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      this.presentToast(this.errores(error.message));
      console.log(error.message);
    }
  }
  async guardarNuevoAlumno(email: any, contra: any, nomb: string, ape: string, tel: number, cinto: string, pes: number, trf: string, foto: any,dni : string, fecha : any) {
    try {
      const docRef = await addDoc(collection(this.db, "alumnos"), {
        correo: email,
        password: contra,
        nombre: nomb,
        apellidos: ape,
        telefono: tel,
        cinturon: cinto,
        tarifa: trf,
        peso: pes,
        avatar: foto,
        dni:dni,
        fecha:fecha
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  async presentToast(mensaje: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000 // duración en milisegundos
    });
    toast.present();
  }
  errores(error: string): string {

    switch (error) {
      case 'Firebase: Error (auth/admin-restricted-operation).':
        return 'Introducir datos';
        break;
      case 'Firebase: Error (auth/missing-password).':
        return 'Introducir contraseña';
        break;
      case 'Firebase: Error (auth/invalid-email).':
        return 'Introducir un email valido (example@example.com)';
        break;
      case 'Firebase: Password should be at least 6 characters (auth/weak-password).':
        return 'Introducir una contraseña de mas de 6 o más caracteres'
        break;

      default:
        break;
    }
    return 'Datos incorrectos'
  }
  iniciarSesion(email: any, contra: any) {
    const auth = getAuth();
    setPersistence(auth, browserSessionPersistence)
      .then(async (_) => {
        return signInWithEmailAndPassword(auth, email, contra)
          .then((userCredential) => {
            this.presentToast('Bienvenido');

            // Signed in
            const user = userCredential.user;
            this.navCtrl.navigateForward('/clases');
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error)
          });
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }
  recuperarAlumno(email: string): Promise<any> {
    const citiesRef = collection(this.db, "alumnos");
    const q = query(citiesRef, where("correo", "==", email));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const alumno = doc.data();
            resolve(alumno);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  getAllAlumnos() : Promise<any>{
    const citiesRef = collection(this.db, "alumnos");
    const q = query(citiesRef);
    const alumnos: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            alumnos.push(doc.data());
            resolve(alumnos);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  // Añadir nueva clase y ver anteriores
  async subirNuevaClase(fechas: string[], hora: string, alumno: string[], titulo: string) {
    try {

      fechas.map(async (fecha: any) => {

        const docRef = await addDoc(collection(this.db, "clases"), {
          titulo: titulo,
          fecha: fecha,
          hora: hora,
          alumno: alumno
        }).then(() => {

          console.log("Document writte");
        }).catch(() => {

          console.log("Fail");
        });

      }
      );

    } catch (e) {
      console.error("Error adding document: ", e);
    }

  }
  recuperarClase(fecha: string, hora: string): Promise<any> {
    const citiesRef = collection(this.db, "clases");
    const q = query(citiesRef, where("fecha", "==", fecha), where("hora", "==", hora));


    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            console.log(doc.ref)
            const clase = doc.data();
            resolve(clase);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  apuntarAlumno(fecha: string, hora: string, alumno: string) {
    const citiesRef = collection(this.db, "clases");
    const q = query(citiesRef, where("fecha", "==", fecha), where("hora", "==", hora));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, { alumno: arrayUnion(alumno) })
            const clase = doc.data();
            resolve(clase);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  borrarAlumno(fecha: string, hora: string, alumno: string) {
    const citiesRef = collection(this.db, "clases");
    const q = query(citiesRef, where("fecha", "==", fecha), where("hora", "==", hora));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {

            updateDoc(doc.ref, { alumno: arrayRemove(alumno) })
            const clase = doc.data();
            resolve(clase);
          });
          resolve(null); // Si no se encuentra ningún alumno
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  recuperarClasesDia(fecha: string): Promise<any[]> {
    const citiesRef = collection(this.db, "clases");
    const q = query(citiesRef, where("fecha", "==", fecha));
    const clase: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {

            clase.push(doc.data());
            resolve(clase);
          });
          resolve(clase); // Si no se encuentra ninguna clase con la fecha especifica
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  borrarClase(fecha: string, hora: string) {
    const citiesRef = collection(this.db, "clases");
    const q = query(citiesRef, where("fecha", "==", fecha), where("hora", "==", hora));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach(async (doc) => {

            await deleteDoc(doc.ref).catch(
              (error) => {
                reject(error);
              }
            )
            const clase = doc.data();
            resolve(clase);
          });
          resolve(null);
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  // Eventos
  async subirNuevoEvento(nombre: string, fecha: string, foto: string, precio: number, organizador: string, localidad: string,modalidades:string[],categorias:string[],pesos:string[]) {
    try {
      const docRef = await addDoc(collection(this.db, "eventos"), {
        nombre: nombre,
        foto: foto,
        fecha: fecha,
        precio: precio,
        organizador: organizador,
        localidad: localidad,
        modalidades:modalidades,
        categorias:categorias,
        pesos:pesos
      }).then(() => {
        console.log("Document writte");
      }).catch(() => {

        console.log("Fail");
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  borrarEvento(fecha: string, organizador: string) {
    const eventosRef = collection(this.db, "eventos");
    const q = query(eventosRef, where("fecha", "==", fecha), where("organizador", "==", organizador));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach(async (doc) => {

            await deleteDoc(doc.ref).catch(
              (error) => {
                reject(error);
              }
            )
            const evento = doc.data();
            resolve(evento);
          });
          resolve(null);
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  recuperarEvento(fecha: string): Promise<any> {
    const citiesRef = collection(this.db, "eventos");
    const q = query(citiesRef, where("fecha", "==", fecha));
    const eventos: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            console.log(doc.ref)
            eventos.push(doc.data());
            resolve(eventos);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  getAllEvents(): Promise<any>{
    const citiesRef = collection(this.db, "eventos");
    const q = query(citiesRef);
    const eventos: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            eventos.push(doc.data());
            resolve(eventos);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  //Pagos
 async nuevoPago(alumno:string,apellidos:string,tarifa:string,formaPago:string,fecha:string,importe:number){
    try {
      const docRef = await addDoc(collection(this.db, "pagos"), {
        alumno: alumno,
        apellidos:apellidos,
        tarifa: tarifa,
        fecha: fecha,
        formaPago: formaPago,
        importe:importe
      }).then(() => {
        console.log("Document writte");
      }).catch(() => {
        console.log("Fail");
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  getAllPagos(): Promise<any>{
    const citiesRef = collection(this.db, "pagos");
    const q = query(citiesRef);
    const pagos: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            pagos.push(doc.data());
            resolve(pagos);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  recuperarPagosNombre(nombre: string,apellidos:string): Promise<any> {
    const citiesRef = collection(this.db, "pagos");
    const q = query(citiesRef, where("alumno", "==", nombre),where("apellidos", "==", apellidos));
    const pagos: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.ref)
            pagos.push(doc.data());
            resolve(pagos);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  recuperarPagosFecha(fecha: string): Promise<any> {
    const citiesRef = collection(this.db, "pagos");
    const q = query(citiesRef, where("fecha", "==", fecha));
    const pagos: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.ref)
            pagos.push(doc.data());
            resolve(pagos);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  borrarPago(fecha: string, alumno: string) {
    const pagosRef = collection(this.db, "pagos");
    const q = query(pagosRef, where("fecha", "==", fecha), where("alumno", "==", alumno));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach(async (doc) => {

            await deleteDoc(doc.ref).catch(
              (error) => {
                reject(error);
              }
            )
            const evento = doc.data();
            resolve(evento);
          });
          resolve(null);
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  // Perfil
  actualizarAlumno(email: string, nomb: string, ape: string, tel: number, cinto: string, pes: number, trf: string, foto: any): Promise<any>{
    const citiesRef = collection(this.db, "alumnos");
    const q = query(citiesRef, where("correo", "==", email));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, {
              nombre: nomb,
              apellidos: ape,
              telefono: tel,
              cinturon: cinto,
              tarifa: trf,
              peso: pes,
              avatar: foto
            })
            const clase = doc.data();
            resolve(clase);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  actualizarContra(email: string, contra: any) : Promise<any>{
    const citiesRef = collection(this.db, "alumnos");
    const q = query(citiesRef, where("correo", "==", email));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, {
              password: contra,
            })
            const clase = doc.data();
            resolve(clase);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  // Entrenaientos
  async subirNuevoEntreno(tipo : string , nombre : string , ejercicios : string[] , series : number , repeticiones : string) {
    try {
      const docRef = await addDoc(collection(this.db, "entrenamientos"), {
        tipo: tipo,
        nombre: nombre,
        ejercicios : ejercicios,
        series : series,
        repeticiones : repeticiones
      }).then(() => {
        console.log("Document writte");
      }).catch(() => {

        console.log("Fail");
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  recuperarEntrenamientoTipo(tipo: string): Promise<any> {
    const citiesRef = collection(this.db, "entrenamientos");
    const q = query(citiesRef, where("tipo", "==", tipo));
    const entreno: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.ref)
            entreno.push(doc.data());
            resolve(entreno);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  getAllEntrenos(): Promise<any>{
    const citiesRef = collection(this.db, "entrenamientos");
    const q = query(citiesRef);
    const entrenamientos: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            entrenamientos.push(doc.data());
            resolve(entrenamientos);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  borrarEntreno(nombre: string, tipo: string) {
    const eventosRef = collection(this.db, "entrenamientos");
    const q = query(eventosRef, where("nombre", "==", nombre), where("tipo", "==", tipo));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach(async (doc) => {

            await deleteDoc(doc.ref).catch(
              (error) => {
                reject(error);
              }
            )
            const evento = doc.data();
            resolve(evento);
          });
          resolve(null);
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  recuperarEntrenamientoNombre(nombre: string): Promise<any> {
    const citiesRef = collection(this.db, "entrenamientos");
    const q = query(citiesRef, where("nombre", ">=", nombre), where("nombre", "<=", nombre + '\uf8ff'));
    const entreno: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.ref)
            entreno.push(doc.data());
            resolve(entreno);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  //Alumnos
  actualizarAlumnoProfe(email: string, tel: number, cinto: string, pes: number, trf: string,dni : string,fecha : string,esProfe : boolean,grados : number): Promise<any>{
    const citiesRef = collection(this.db, "alumnos");
    const q = query(citiesRef, where("correo", "==", email));

    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {

          querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, {
              telefono: tel,
              cinturon: cinto,
              tarifa: trf,
              peso: pes,
              dni : dni,
              fecha : fecha,
              profesor : esProfe,
              grados : grados
            })
            const clase = doc.data();
            resolve(clase);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });

  }
  recuperarAlumnosNombre(nombre: string,apellidos:string): Promise<any> {
    const citiesRef = collection(this.db, "alumnos");
    const q = query(citiesRef, where("nombre", "==", nombre),where("apellidos", "==", apellidos));
    const alumnos: any[] = [];
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.ref)
            alumnos.push(doc.data());
            resolve(alumnos);
          });
          resolve(null); // Si no se encuentra ningún alumno con el correo especificado
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}






