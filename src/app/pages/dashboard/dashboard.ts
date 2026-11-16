import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DashboardTool {
  title: string;
  description: string;
  route: string;
  action: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit{

   tools: DashboardTool[] = [];

  ngOnInit(): void {
    this.loadTools();
  }

  loadTools(): void {
    this.tools = [
      {
        title: 'Personajes',
        description: 'Consulta tus personajes',
        route: '/personajes',
        action: 'Ver personajes'
      },
      {
        title: 'Monstruos',
        description: 'Explora criaturas y enemigos',
        route: '/monstruos',
        action: 'Ver monstruos'
      },
      {
        title: 'Campanas',
        description: 'Administra tus aventuras',
        route: '/campanias',
        action: 'Ver campanas'
      },
      {
        title: 'Diario',
        description: 'Consulta las notas de tus aventuras',
        route: '/diario',
        action: 'Ver diario'
      },
      {
        title: 'Encuentros',
        description: 'Accede a tus encuentros',
        route: '/encuentros',
        action: 'Ver encuentros'
      }
    ];
  }

}
