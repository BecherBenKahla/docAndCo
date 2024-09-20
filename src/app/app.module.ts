import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
<<<<<<< HEAD
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDividerModule} from '@angular/material/divider';
=======
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
>>>>>>> ca-advanced-search
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdavancedSearchComponent } from './components/adavanced-search/adavanced-search.component';
import { SearchBarComponent } from './components/adavanced-search/search-bar/search-bar.component';
import { HighlightPipe } from './common/pipes/highlight.pipe';
import { AlphabeticPipePerson } from './common/pipes/alphabetic.pipe';
import { AlphabeticPipePecialty } from './common/pipes/alphabetic.pipe';
<<<<<<< HEAD
import { PersonDetailComponent } from './person-detail/person-detail.component';
import { MatPaginatorModule } from '@angular/material/paginator';

=======
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { CustomPaginator } from './common/translations/custom-mat-paginator-intl';
>>>>>>> ca-advanced-search

@NgModule({
  declarations: [
    AppComponent,
    AdavancedSearchComponent,
    SearchBarComponent,
    HighlightPipe,
    AlphabeticPipePerson,
    AlphabeticPipePecialty,
<<<<<<< HEAD
    PersonDetailComponent
=======
>>>>>>> ca-advanced-search
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    FlexLayoutModule,
    MatRadioModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDividerModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    HttpClientModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
