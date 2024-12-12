import { HttpParams } from "@angular/common/http";

/**
* Stringifies the Query Parameters
*
* @param queryParams
* @returns string of query parameters
*/
export function stringify(queryParams: any) {
   let params = new HttpParams();

   Object.keys(queryParams).forEach(key => {
       params = params.set(key, queryParams[key]);
   });
   return params;
}