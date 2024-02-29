import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { retry } from 'rxjs/operators';
import { AUTH_ROUTES } from './auth.routes';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor(private http: HttpClient) { }

  /**
   * Encrypts a object of data to RSA using a randomly generated key from the backend
   *
   * @param data The data to encrypt
   * @returns The encrypted data and the public key { publicKey: string, data: string }
   */
  async encryptRSA(data: object) {
    // Get the key and encrypt the data
    const key = await this.importPublicKey();
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      key.key,
      new TextEncoder().encode(JSON.stringify(data))
    );

    // Return the encrypted data as a string instead of a array buffer, and also the public key used
    return {
      data: JSON.stringify(Array.from(new Uint8Array(encrypted))),
      publicKey: key.publicKey,
    };
  }

  /**
   * Gets the randomly generated public key from the backend and parses it so it can be used by the
   * web crypto package to encrypt data
   *
   * @returns A CryptoKey object (used for encryption) and a publicKey string (used to send to the
   * backend to decrypt) { key: CryptoKey, publicKey: string }
   */
  private async importPublicKey() {
    // Get key from backend
    const publicKey = (
      await this.http
        .get<{ publicKey: string }>(AUTH_ROUTES.GET_KEY_PAIR())
        .pipe(retry(3))
        .toPromise()
    ).publicKey;

    // Parse out the key using RSA-OAEP and a SHA256 hash
    return {
      key: await crypto.subtle.importKey(
        'spki',
        this.getSpkiDer(publicKey),
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['encrypt']
      ),
      publicKey,
    };
  }

  /**
   * Removes the header and footer from a public key and transforms it to a array
   * buffer so it can be properly imported into the web crypto package
   *
   * @param publicKey The public key to parse
   * @returns A array buffer fo the public key
   */
  private getSpkiDer(publicKey: string) {
    const header = '-----BEGIN PUBLIC KEY-----';
    const footer = '-----END PUBLIC KEY------';

    // Parse out the key contents
    const pemContents = publicKey.substring(
      header.length,
      publicKey.length - footer.length
    );
    const binaryDerString = atob(pemContents);

    // Return the contents converted to a array buffer
    return this.str2ab(binaryDerString);
  }

  /**
   * Converts a string to a array buffer
   *
   * @param str The string to convert
   * @returns An array buffer of the string
   */
  private str2ab(str: string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
}
