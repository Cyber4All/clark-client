import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AUTH_ROUTES } from "./auth.routes";

@Injectable({
    providedIn: "root",
})
export class EncryptionService {
    constructor(private http: HttpClient) {}

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
                name: "RSA-OAEP",
            },
            key.key,
            new TextEncoder().encode(JSON.stringify(data)),
        );

        // Return the encrypted data as a string instead of a array buffer, and also the public key used
        return {
            data: JSON.stringify(Array.from(new Uint8Array(encrypted))),
            publicKey: key.publicKey,
        };
    }

    // Envelope encryption using AES-GCM for the payload and RSA-OAEP to wrap the AES key
    async encryptPayload(data: object) {
        try {
            const rsaKey = await this.importPublicKey(); // RSA public wrapping Key
            const aesKey = await crypto.subtle.generateKey(
                // AES data encryption Key
                {
                    name: "AES-GCM",
                    length: 256,
                },
                true,
                ["encrypt", "decrypt"],
            );

            // Initialization Vector for AES, initial starting state for encryption to prevent identifying patterns in encrypted data
            // Should be random and unique for each encryption but does not need to be secret
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Encrypted User Data using AES-GCM
            const encryptedPayload = await crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv,
                },
                aesKey,
                new TextEncoder().encode(JSON.stringify(data)),
            );

            // Encrypt/wrap the AES key using the RSA public key, so it can be safely sent to the backend to decrypt the data
            const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
            const encryptedKey = await crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP",
                },
                rsaKey.key,
                rawAesKey,
            );

            // Web Crypto AES-GCM returns ciphertext with the 16-byte auth tag appended at the end.
            // Node's AES-GCM decrypt API expects the auth tag separately, so split it off here.
            // The auth tag lets the backend verify the ciphertext was not tampered with, prevents tampering with encrypted data
            // to send corrupt data to clark-service
            const encryptedPayloadBytes = new Uint8Array(encryptedPayload);
            const authTag = encryptedPayloadBytes.slice(
                encryptedPayloadBytes.length - 16,
            );

            // The encrypted data is the encrypted payload without the auth tag, since the auth tag is needed to decrypt the data and is not actually part of the encrypted data
            const encryptedData = encryptedPayloadBytes.slice(
                0,
                encryptedPayloadBytes.length - 16,
            );

            return {
                data: JSON.stringify(Array.from(encryptedData)),
                encryptedKey: JSON.stringify(
                    Array.from(new Uint8Array(encryptedKey)),
                ),
                iv: JSON.stringify(Array.from(iv)),
                authTag: JSON.stringify(Array.from(authTag)),
                publicKey: rsaKey.publicKey,
            };
        } catch (error) {
            console.error("Error encrypting data:", error);
            throw error;
        }
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
                .toPromise()
        ).publicKey;

        // Parse out the key using RSA-OAEP and a SHA256 hash
        return {
            key: await crypto.subtle.importKey(
                "spki",
                this.getSpkiDer(publicKey),
                {
                    name: "RSA-OAEP",
                    hash: "SHA-256",
                },
                true,
                ["encrypt"],
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
        const header = "-----BEGIN PUBLIC KEY-----";
        const footer = "-----END PUBLIC KEY------";

        // Parse out the key contents
        const pemContents = publicKey.substring(
            header.length,
            publicKey.length - footer.length,
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
