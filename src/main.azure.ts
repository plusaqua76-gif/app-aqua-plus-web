import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfigAzure } from './app/app.config.azure';

bootstrapApplication(App, appConfigAzure)
  .catch((err) => console.error(err));
