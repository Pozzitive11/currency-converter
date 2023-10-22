import { Component } from '@angular/core';
import { CurrencyService } from '../currency-service.service';
import { FormControl } from '@angular/forms';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  pairwise,
  startWith,
} from 'rxjs';

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss'],
})
export class CurrencyConverterComponent {
  amountFromControl = new FormControl(0);
  amountToControl = new FormControl(0);
  currencyFromControl = new FormControl('USD');
  currencyToControl = new FormControl('UAH');

  currencyKeys: string[];
  exchangeRates: { [key: string]: number } = {};
  filteredCurrencies: string[] = ['UAH', 'USD', 'EUR'];

  constructor(private currencyService: CurrencyService) {}
  ngOnInit(): void {
    this.initSubscriptions();

    this.currencyService
      .getCurrencyRates()
      .pipe(filter((data) => data.conversion_rates))
      .subscribe((data: any) => {
        this.exchangeRates = data.conversion_rates;
        this.currencyKeys = Object.keys(this.exchangeRates).filter((currency) =>
          this.filteredCurrencies.includes(currency)
        );
        this.amountFromControl.setValue(1);
      });
  }

  initSubscriptions() {
    this.amountFromControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        const convertedAmount = (
          value *
          this.exchangeRates[this.currencyFromControl.value] *
          this.exchangeRates[this.currencyToControl.value]
        ).toFixed(2);

        this.setControls(value, +convertedAmount);
      });

    this.amountToControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        const convertedAmount = (
          value /
          (this.exchangeRates[this.currencyToControl.value] *
            this.exchangeRates[this.currencyFromControl.value])
        ).toFixed(2);

        this.setControls(+convertedAmount, value);
      });

    this.currencyFromControl.valueChanges.subscribe((value) => {
      const convertedAmount = (
        this.amountFromControl.value *
        this.exchangeRates[value] *
        this.exchangeRates[this.currencyToControl.value]
      ).toFixed(2);

      this.setControls(this.amountFromControl.value, +convertedAmount);
    });

    this.currencyToControl.valueChanges.subscribe((value) => {
      const convertedAmount = (
        this.amountToControl.value /
        (this.exchangeRates[value] *
          this.exchangeRates[this.currencyFromControl.value])
      ).toFixed(2);

      this.setControls(+convertedAmount, this.amountToControl.value);
    });

    combineLatest([
      this.currencyFromControl.valueChanges.pipe(startWith('USD'), pairwise()),
      this.currencyToControl.valueChanges.pipe(startWith('UAH'), pairwise()),
    ]).subscribe((value) => {
      console.log(value);
      if (value[0][1] === value[1][1]) {
        this.currencyFromControl.setValue(value[1][0]);
        this.currencyToControl.setValue(value[0][1]);
      }
    });
  }
  setControls(value: number, convertedAmount: number) {
    this.amountFromControl.setValue(value, {
      emitEvent: false,
    });
    this.amountToControl.setValue(convertedAmount, {
      emitEvent: false,
    });
  }
}
