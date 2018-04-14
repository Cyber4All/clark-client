import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'encodeURIComponent'
})
/**
 * Encodes special characters in a URL string.
 */
export class EncodeUriComponentPipe implements PipeTransform {
  transform(uriComponent: string): string {
    return encodeURIComponent(uriComponent).replace(/[!'()*]/g, (c) => {
      // Also encode !, ', (, ), and *
      return '%' + c.charCodeAt(0).toString(16);
    });
  }
}
