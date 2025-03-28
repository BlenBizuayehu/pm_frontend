import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { importProvidersFrom } from '@angular/core'; // Import importProvidersFrom for HttpClientModule
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Import routes from app.routes.ts

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule), // Provide HttpClientModule
    provideRouter(routes), // Provide the routes here
  ],
}).catch(err => console.error(err));
