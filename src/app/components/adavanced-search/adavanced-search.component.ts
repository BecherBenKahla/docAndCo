import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, finalize, tap } from 'rxjs';
import { AdvancedSearchService } from 'src/app/services/advanced-search/advanced-search.service';

@Component({
  selector: 'app-adavanced-search',
  templateUrl: './adavanced-search.component.html',
  styleUrls: ['./adavanced-search.component.scss']
})
export class AdavancedSearchComponent implements OnInit {

  displayedColumns: string[] = ['profil', 'identite', 'specialite', 'structure', 'localisation', 'distance', 'actions'];
  dataSource: MatTableDataSource<any>;
  sortBy = 'firstName';
  isLoading = true;
  combinedData :any;

  constructor(private advancedSearchService: AdvancedSearchService) {
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
    this.getSearchData();
  }

  getSearchData() {
    combineLatest([
      this.advancedSearchService.getPersons(),
      this.advancedSearchService.getSpecialities(),
      this.advancedSearchService.getStructures(),
    ]).pipe(
      tap({
        next: ([persons, specialities, structures]) => {
          this.combinedData = [persons, specialities, structures];
        }
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  removeChip() {
    console.log('Chip supprimé');
  }

  removeAllFilters() {
    console.log('Supprimer tous les filtres');
  }

  getItemsFromChild(items: any) {
    console.log(items);
  }

}
