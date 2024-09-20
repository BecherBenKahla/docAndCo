import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'alphabeticPerson'
})
export class AlphabeticPipePerson implements PipeTransform {

<<<<<<< HEAD
  transform(data : any): any {
    return data.sort((a:any, b:any) => 
=======
  transform(data: any): any {
    return data.sort((a: any, b: any) =>
>>>>>>> ca-advanced-search
      a.lastName.localeCompare(b.lastName) || a.firstName - b.firstName
    );
  }

}

@Pipe({
  name: 'alphabeticSpecialty'
})
export class AlphabeticPipePecialty implements PipeTransform {
<<<<<<< HEAD
  transform(data : any): any {
    return data.sort((a:any, b:any) => 
      a.name.localeCompare(b.name) 
    );
  }
}
=======
  transform(data: any): any {
    return data.sort((a: any, b: any) =>
      a.name.localeCompare(b.name)
    );
  }
}
>>>>>>> ca-advanced-search
