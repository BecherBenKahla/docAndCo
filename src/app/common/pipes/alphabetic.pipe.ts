import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'alphabeticPerson'
})
export class AlphabeticPipePerson implements PipeTransform {

  transform(data: any): any {
    return data.sort((a: any, b: any) =>
      a.lastName.localeCompare(b.lastName) || a.firstName - b.firstName
    );
  }

}

@Pipe({
  name: 'alphabeticSpecialty'
})
export class AlphabeticPipeSpecialty implements PipeTransform {
  
  transform(data: any): any {
    return data.sort((a: any, b: any) =>
      a.name.localeCompare(b.name)
    );
  }
}
