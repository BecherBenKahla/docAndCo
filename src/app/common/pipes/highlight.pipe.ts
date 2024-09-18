import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

    transform(text: string, search: any, cssClass: string): string {
        /** accent insensitive  and case insensitive */
        const accentMap: { [key: string]: string } = {
            ae: '(ae|æ|ǽ|ǣ)',
            a: '(a|á|ă|ắ|ặ|ằ|ẳ|ẵ|ǎ|â|ấ|ậ|ầ|ẩ|ẫ|ä|ǟ|ȧ|ǡ|ạ|ȁ|à|ả|ȃ|ā|ą|ᶏ|ẚ|å|ǻ|ḁ|ⱥ|ã)',
            c: '(c|ć|č|ç|ḉ|ĉ|ɕ|ċ|ƈ|ȼ)',
            e: '(e|é|ĕ|ě|ȩ|ḝ|ê|ế|ệ|ề|ể|ễ|ḙ|ë|ė|ẹ|ȅ|è|ẻ|ȇ|ē|ḗ|ḕ|ⱸ|ę|ᶒ|ɇ|ẽ|ḛ)',
            i: '(i|í|ĭ|ǐ|î|ï|ḯ|ị|ȉ|ì|ỉ|ȋ|ī|į|ᶖ|ɨ|ĩ|ḭ)',
            n: '(n|ń|ň|ņ|ṋ|ȵ|ṅ|ṇ|ǹ|ɲ|ṉ|ƞ|ᵰ|ᶇ|ɳ|ñ)',
            o: '(o|ó|ŏ|ǒ|ô|ố|ộ|ồ|ổ|ỗ|ö|ȫ|ȯ|ȱ|ọ|ő|ȍ|ò|ỏ|ơ|ớ|ợ|ờ|ở|ỡ|ȏ|ō|ṓ|ṑ|ǫ|ǭ|ø|ǿ|õ|ṍ|ṏ|ȭ)',
            u: '(u|ú|ŭ|ǔ|û|ṷ|ü|ǘ|ǚ|ǜ|ǖ|ṳ|ụ|ű|ȕ|ù|ủ|ư|ứ|ự|ừ|ử|ữ|ȗ|ū|ṻ|ų|ᶙ|ů|ũ|ṹ|ṵ)'
        };
        const accentRegex = new RegExp(Object.keys(accentMap).join('|'), 'g');

        const pattern = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
            .split(' ')
            .filter((t: any) => t.length > 0);

        const baseRegex = new RegExp(`\\b(${pattern})`.replace(accentRegex, m => {
            return accentMap[m] || m;
        }), 'gi');

        return search ? text.replace(baseRegex, (match: any) => `<span class="${cssClass}">${match}</span>`) : text;
    }
}
