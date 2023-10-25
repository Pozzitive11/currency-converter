import { Component, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { CurrencyService } from 'src/app/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  usdRate = 0;
  eurRate = 0;

  constructor(
    private currencyService: CurrencyService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.currencyService
      .getCurrencyRates()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((data) => 'conversion_rates' in data)
      )
      .subscribe((data) => {
        this.usdRate =
          data.conversion_rates['USD'] * data.conversion_rates['UAH'];
        this.eurRate =
          data.conversion_rates['EUR'] * data.conversion_rates['UAH'];
      });
  }
}
