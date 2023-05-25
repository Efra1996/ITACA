import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private avatar! : string;
  private nombreFoto! : string;
  constructor() {
    
  }
  

  getAvatarPerfil(): string{
    console.log(this.avatar)
    return this.avatar;
  }

  setAvatarPerfil( data : string){
    this.avatar=data;
    localStorage.setItem('avatar', data); 
  }

  getNombre(){
    return this.nombreFoto;
  }

  setNombre(data : string){
    this.nombreFoto=data;
  }

}
