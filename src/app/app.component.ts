import { Component, OnInit } from '@angular/core';
import { CurrencyService } from './currency-service.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  usdRate = 0;
  eurRate = 0;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit() {
    this.currencyService.getCurrencyRates().subscribe((data) => {
      this.usdRate = data.conversion_rates.USD * data.conversion_rates.UAH;
      this.eurRate = data.conversion_rates.EUR * data.conversion_rates.UAH;
    });
  }
}
