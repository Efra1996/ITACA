import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponetsRoutingModule } from './componets-routing.module';
import { ReservasComponent } from './reservas/reservas.component';


@NgModule({
  declarations: [ReservasComponent],
  imports: [
    CommonModule,
    ComponetsRoutingModule,
  ],exports:[
    ReservasComponent
  ]
})
export class ComponetsModule { }
