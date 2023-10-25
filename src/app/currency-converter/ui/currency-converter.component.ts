import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  pairwise,
  startWith,
} from 'rxjs';
import { ExchangeRateData } from 'src/app/models/currency.model';
import { CurrencyService } from 'src/app/services';

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyConverterComponent implements OnInit {
  private exchangeRates: { [key: string]: number } = {};
  private filteredCurrencies: string[] = ['UAH', 'USD', 'EUR'];

  currencyKeys: string[];
  amountFromControl = new FormControl(0);
  amountToControl = new FormControl(0);
  currencyFromControl = new FormControl('USD');
  currencyToControl = new FormControl('UAH');

  constructor(
    private currencyService: CurrencyService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.initSubscriptions();

    this.currencyService
      .getCurrencyRates()
      .pipe(
        filter((data) => 'conversion_rates' in data),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data: ExchangeRateData) => {
        this.exchangeRates = data.conversion_rates;
        this.currencyKeys = Object.keys(this.exchangeRates).filter((currency) =>
          this.filteredCurrencies.includes(currency)
        );
        this.amountFromControl.setValue(1);
      });
  }

  initSubscriptions(): void {
    this.amountFromControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), distinctUntilChanged())
      .subscribe((value) => {
        const convertedAmount = (
          value *
          this.multiplyExchangeRates(
            this.currencyFromControl.value,
            this.currencyToControl.value
          )
        ).toFixed(2);

        this.setControls(value, +convertedAmount);
      });

    this.amountToControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), distinctUntilChanged())
      .subscribe((value) => {
        const convertedAmount = (
          value /
          this.multiplyExchangeRates(
            this.currencyToControl.value,
            this.currencyFromControl.value
          )
        ).toFixed(2);

        this.setControls(+convertedAmount, value);
      });

    this.currencyFromControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const convertedAmount = (
          this.amountFromControl.value *
          this.multiplyExchangeRates(value, this.currencyToControl.value)
        ).toFixed(2);

        this.setControls(this.amountFromControl.value, +convertedAmount);
      });

    this.currencyToControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const convertedAmount = (
          this.amountToControl.value /
          this.multiplyExchangeRates(value, this.currencyFromControl.value)
        ).toFixed(2);

        this.setControls(+convertedAmount, this.amountToControl.value);
      });

    combineLatest([
      this.currencyFromControl.valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef),
        startWith('USD'),
        pairwise()
      ),
      this.currencyToControl.valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef),
        startWith('UAH'),
        pairwise()
      ),
    ]).subscribe((value) => {
      if (value[0][1] === value[1][1]) {
        this.currencyFromControl.setValue(value[1][0]);
        this.currencyToControl.setValue(value[0][1]);
      }
    });
  }

  multiplyExchangeRates(valueFrom: string, valueTo: string): number {
    return this.exchangeRates[valueFrom] * this.exchangeRates[valueTo];
  }

  setControls(value: number, convertedAmount: number): void {
    this.amountFromControl.setValue(value, {
      emitEvent: false,
    });
    this.amountToControl.setValue(convertedAmount, {
      emitEvent: false,
    });
  }
}
