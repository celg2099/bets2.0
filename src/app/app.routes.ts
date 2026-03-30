import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LigaPageComponent } from './liga-page/liga-page.component';
import { HotListComponent } from './hot-list/hot-list.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'liga', component: LigaPageComponent },
      { path: 'hot-list', component: HotListComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
