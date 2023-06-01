export interface Interfaces {
}

export interface Clase{
    fecha:string,
    hora : any,
    alumno : string[];
    titulo : string;
    apuntado?:boolean;
    finalizada?:boolean;
    nombreAlumnos?:string[];

}
export interface Alumno{
    nombre:string,
    avatar:string,
    email?:string,
    tarifa?:string
}
export interface Evento{
    fecha:string,
    foto : string,
    localidad:string,
    nombre: string,
    organizador:string,
    precio:number,
    modalidades?:string[];
    categorias?:string[],
    pesos?:string[],
}
export interface Pago{
    fecha:string,
    alumno : string;
    tarifa : string;
    formaPago?:string;
    importe?:number
}

export interface Entrenamiento{
    tipo : string,
    nombre : string,
    ejercicios : string[],
    series : number,
    repeticiones : string
}
export interface Alumnos{
    nombre:string,
    avatar:string,
    correo?:string,
    tarifa:string,
    apellidos:string,
    cinturon:string,
    peso:number,
    telefono:number,
    dni?:string,
    fecha?:string,
    grados?:number,
    profesor? : boolean


}
