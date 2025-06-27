import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './features/page-not-found/page-not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((c) => c.HomeComponent)
  },
  {
    path: 'cat',
    loadComponent: () => import('./features/cat/cat.component').then((c) => c.CatComponent)
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];
