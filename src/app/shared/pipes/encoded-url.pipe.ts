import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'encodeURIComponent'
})
/**
 * Wraps the encodeURIForRouter function for consumption as an Angular pipe.
 */
export class EncodeUriComponentPipe implements PipeTransform {
  transform(uriComponent: string): string {
    return encodeURIForRouter(uriComponent);
  }
}

/**
 * Encodes special characters in a URL string.
 *
 * @param uri the URI string to be encoded
 */
export function encodeURIForRouter(uri: string): string {
  return encodeURIComponent(uri).replace(/[!'()*]/g, (c) => {
    // Also encode !, ', (, ), and *
    return '%' + c.charCodeAt(0).toString(16);
  });
}
