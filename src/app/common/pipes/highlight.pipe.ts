import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(text: string, search: any, cssClass: string): string {
    if (!search || !text) {
      return text;
    }

    /** Accent insensitive and case insensitive */
    const accentMap: { [key: string]: string } = {
      ae: '(ae|æ|ǽ|ǣ)',
      a:  '(a|á|ă|ắ|ặ|ằ|ẳ|ẵ|ǎ|â|ấ|ậ|ầ|ẩ|ẫ|ä|ǟ|ȧ|ǡ|ạ|ȁ|à|ả|ȃ|ā|ą|ᶏ|ẚ|å|ǻ|ḁ|ⱥ|ã)',
      c:  '(c|ć|č|ç|ḉ|ĉ|ɕ|ċ|ƈ|ȼ)',
      e:  '(e|é|ĕ|ě|ȩ|ḝ|ê|ế|ệ|ề|ể|ễ|ḙ|ë|ė|ẹ|ȅ|è|ẻ|ȇ|ē|ḗ|ḕ|ⱸ|ę|ᶒ|ɇ|ẽ|ḛ)',
      i:  '(i|í|ĭ|ǐ|î|ï|ḯ|ị|ȉ|ì|ỉ|ȋ|ī|į|ᶖ|ɨ|ĩ|ḭ)',
      n:  '(n|ń|ň|ņ|ṋ|ȵ|ṅ|ṇ|ǹ|ɲ|ṉ|ƞ|ᵰ|ᶇ|ɳ|ñ)',
      o:  '(o|ó|ŏ|ǒ|ô|ố|ộ|ồ|ổ|ỗ|ö|ȫ|ȯ|ȱ|ọ|ő|ȍ|ò|ỏ|ơ|ớ|ợ|ờ|ở|ỡ|ȏ|ō|ṓ|ṑ|ǫ|ǭ|ø|ǿ|õ|ṍ|ṏ|ȭ)',
      u:  '(u|ú|ŭ|ǔ|û|ṷ|ü|ǘ|ǚ|ǜ|ǖ|ṳ|ụ|ű|ȕ|ù|ủ|ư|ứ|ự|ừ|ử|ữ|ȗ|ū|ṻ|ų|ᶙ|ů|ũ|ṹ|ṵ)'
    };
    const accentRegex = new RegExp(Object.keys(accentMap).join('|'), 'g');
    // Normalize and prepare search term
    const pattern = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents for the search term
      .toLowerCase()
      .replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") // Escape regex special characters
      .split(/[\s-]+/) // Split search input by spaces or hyphens
      .filter((t:any) => t.length > 0) // Remove empty values
      .map((term:any) => term.replace(accentRegex, (m:any) => accentMap[m] || m)) // Map accented characters
      .join('|');

      // Create a regex that treats spaces, hyphens, and apostrophes as interchangeable
    const baseRegex = new RegExp(`(?:^|\\s|[\\-'’( )])(${pattern.replace(/ /g, '[\\s-]')})`, 'gi');

    return text.replace(baseRegex, (match, p1) => {
      return match.replace(p1, `<span class="${cssClass}">${p1}</span>`);
    });
  }
}
