import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rgMask'
})
export class RgMaskPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    const digits = value.replace(/\D/g, '');
    
    if (digits.length < 8 || digits.length > 9) return value;
    
    if (digits.length === 9) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    }
    
    return digits.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
  }
}
