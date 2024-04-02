import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlannerComponent } from "./planner/planner.component";
import { PlayerComponent } from "./player/player.component";

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'planner', component: PlannerComponent },
    { path: 'player', component: PlayerComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];
