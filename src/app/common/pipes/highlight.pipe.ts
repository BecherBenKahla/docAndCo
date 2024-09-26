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

    // Normalize and prepare the search pattern to handle multiple words
    const pattern = search
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toLowerCase()
      .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") // Escape regex special characters
      .split(/\s+/) // Split search input by spaces for multiple word matches
      .filter((t: any) => t.length > 0); // Remove empty values

    const baseRegex = new RegExp(`\\b(${pattern.join('|')})`.replace(accentRegex, m => {
      return accentMap[m] || m;
    }), 'gi'); // Create a dynamic regex for each search term, handle accents

    // Replace the matched text with the highlighted span
    return text.replace(baseRegex, (match: any) => `<span class="${cssClass}">${match}</span>`);
  }
}
