import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'beautifyUrl'
})
export class BeautifyUrlPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return value;
    }

    const url: URL = new URL(value);
    return url.hostname.replace(/^www\./, '');
  }
}
