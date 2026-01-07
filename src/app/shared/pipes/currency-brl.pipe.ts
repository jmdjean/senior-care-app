import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyBrl'
})
export class CurrencyBrlPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value;
    
    if (isNaN(numValue)) return '';
    
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
