import { UrlSerializer, UrlTree, DefaultUrlSerializer } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CustomUrlSerializer implements UrlSerializer {
    parse(url: any): UrlTree {
        const dus = new DefaultUrlSerializer();

        const path = dus.parse(url.replace(/[!'()*]/g, (c) => {
            // Also encode !, ', (, ), and *
            return '%' + c.charCodeAt(0).toString(16);
        }));

        return path;
    }

    serialize(tree: UrlTree): any {
        const dus = new DefaultUrlSerializer();
        return dus.serialize(tree);

        // FIXME: replaces broken encoding, aka %2520. This shouldn't be needed anymore but
        // return path.replace(/(\%[0-9]{1}[0-9, a-f]{1})(?=[0-9]{1}[0-9, a-f]{1})/g, '%');
    }
}
