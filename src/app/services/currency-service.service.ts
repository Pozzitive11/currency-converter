import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExchangeRateData } from '../models/currency.model';
@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private apiUrl =
    'https://v6.exchangerate-api.com/v6/badf03a5dce3a7a72122a4fa/latest/USD';

  constructor(private http: HttpClient) {}

  getCurrencyRates(): Observable<ExchangeRateData> {
    return this.http.get<ExchangeRateData>(this.apiUrl);
  }
}
