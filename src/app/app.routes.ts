import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'folder',
    pathMatch: 'full',
  },
  {
    path: 'folder',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
  {
    path: 'componets',
    loadChildren: () =>
      import('./componets/componets.module').then((m) => m.ComponetsModule),
  },
  {
    path: 'clases',
    loadComponent: () => import('./pages/clases/clases.page').then( m => m.ClasesPage)
  },
  {
    path: 'eventos',
    loadComponent: () => import('./pages/eventos/eventos.page').then( m => m.EventosPage)
  },
  {
    path: 'pagos',
    loadComponent: () => import('./pages/pagos/pagos.page').then( m => m.PagosPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'entrenamiento',
    loadComponent: () => import('./pages/entrenamiento/entrenamiento.page').then( m => m.EntrenamientoPage)
  },
  {
    path: 'alumnos',
    loadComponent: () => import('./pages/alumnos/alumnos.page').then( m => m.AlumnosPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then( m => m.RegistroPage)
  },

];
