import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { LoginComponent } from '../app/pages/auth/login/login.component'; 
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { sensorService } from './services/sensor.service'; 
import { FirebaseTestComponent } from './components/firestore-test/firestore-test.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [],
  imports: [
    LoginComponent,
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AppRoutingModule,
    AppComponent,
    FirebaseTestComponent,
  ],
  providers: [sensorService], // Capital S
})
export class AppModule {}