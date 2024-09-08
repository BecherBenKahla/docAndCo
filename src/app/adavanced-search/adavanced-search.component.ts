import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-adavanced-search',
  templateUrl: './adavanced-search.component.html',
  styleUrls: ['./adavanced-search.component.scss']
})
export class AdavancedSearchComponent implements OnInit {

  displayedColumns: string[] = ['profil', 'identite', 'specialite', 'structure', 'localisation', 'distance', 'actions'];
  dataSource: MatTableDataSource<any>;
  sortBy = 'firstName';

  constructor() {
    const data = [
      { identite: 'Hôpital de Morvan', specialite: '+9 spécialités disponibles', structure: 'CHRU', localisation: '29 Brest', distance: '137 km' },
      { identite: 'ABGRAL Karim', specialite: 'Cardiologie', structure: 'Hôpital de Morvan', localisation: '29 Brest', distance: '232 km' },
      { identite: 'FERRARI Gisèle', specialite: 'Médecine Interne', structure: 'Hôpital de Morvan', localisation: '29 Brest', distance: '137 km' },
      { identite: 'GAUGUE Vanessa', specialite: 'Médecine Polyvalente', structure: 'Hôpital de Morvan', localisation: '29 Brest', distance: '137 km' },
      { identite: 'VALOGNE Hadia', specialite: 'Gériatrie', structure: 'Hôpital de Morvan', localisation: '29 Brest', distance: '232 km' },
    ];
    this.dataSource = new MatTableDataSource(data);
  }

  ngOnInit(): void {
  }

  removeChip() {
    console.log('Chip supprimé');
  }

  removeAllFilters() {
    console.log('Supprimer tous les filtres');
  }

}
