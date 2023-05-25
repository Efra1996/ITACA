import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservasComponent } from './reservas/reservas.component';

const routes: Routes = [
  
    {
      path : '',
      children:[
        { path: 'reservas',  component : ReservasComponent },

        { path: '**', redirectTo : 'login' },
      ]
    }
  

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponetsRoutingModule { }
