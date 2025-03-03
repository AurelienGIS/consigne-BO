import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {LoggedInGuardService} from './shared/services/logged-in-guard.service';
import {NotFoundComponent} from './shared/components/not-found/not-found.component';
import {ContactComponent} from "./pages/contact/contact.component";
import {AuthGuard} from "./_helpers/auth.guard";
import {Role} from "./user/data/Role";
import {ProfilComponent} from "./user/profil/profil.component";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";
import {ConsommateurComponent} from "./pages/consommateur/consommateur.component";
import {ProducerListComponent} from "./pages/producer-list/producer-list.component";
import {ProducerEngagementComponent} from "./pages/producer-engagement/producer-engagement.component";
import {ResellerEngagementComponent} from "./pages/reseller-engagement/reseller-engagement.component";
import {ResellerListComponent} from "./pages/reseller-list/reseller-list.component";
import {ReemploiComponent} from "./pages/reemploi/reemploi.component";
import {PresentationComponent} from "./pages/presentation/presentation.component";
import {PartnersComponent} from "./pages/partners/partners.component";
import {NewsComponent} from "./pages/news/news.component";
import {MapComponent} from "./pages/map/map.component";
import {FaqComponent} from "./pages/faq/faq.component";

const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'consommateur',
        component: ConsommateurComponent
    },
    {
        path: 'producer-engagement',
        component: ProducerEngagementComponent
    },
    {
        path: 'producer-list',
        component: ProducerListComponent
    },
    {
        path: 'reseller-engagement',
        component: ResellerEngagementComponent
    },
    {
        path: 'reseller-list',
        component: ResellerListComponent
    },
    {
        path: 'reemploi',
        component: ReemploiComponent
    },
    {
        path: 'presentation',
        component: PresentationComponent
    },
    {
        path: 'partners',
        component: PartnersComponent
    },
    {
        path: 'news',
        component: NewsComponent
    },
    {
        path: 'faq',
        component: FaqComponent
    },
    {
        path: 'contact',
        component: ContactComponent
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'user',
        canActivate: [AuthGuard],
        loadChildren: () => import('./user/user.module').then(m => m.UserModule),
        data: {roles: [Role.ADMIN]}
    },
    {
        path: 'bottle',
        canActivate: [AuthGuard],
        loadChildren: () => import('./bottle/bottle.module').then(m => m.BottleModule),
        data: {roles: [Role.ADMIN]}
    },
    {
        path: 'material',
        canActivate: [AuthGuard],
        loadChildren: () => import('./material/material.module').then(m => m.MaterialModule),
        data: {roles: [Role.ADMIN]}
    },
    {
        path: 'me',
        canActivate: [LoggedInGuardService],
        component: ProfilComponent
    },
    {
        path: 'map',
        loadChildren: () => import('./map/map.module').then(m => m.MapModule)
    },
    {
        path: 'not-found',
        component: NotFoundComponent,
    },
    {
        path: '**',
        redirectTo: '/not-found'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        preloadingStrategy: PreloadAllModules
    })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
