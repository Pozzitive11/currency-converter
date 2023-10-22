import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private apiUrl =
    'https://v6.exchangerate-api.com/v6/2ec8058b6939fc0562b49766/latest/USD';

  constructor(private http: HttpClient) {}

  getCurrencyRates(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
