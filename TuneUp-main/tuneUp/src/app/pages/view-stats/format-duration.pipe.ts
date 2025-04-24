import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDuration',
  standalone: true  // Include this if you're using Angular Standalone Components
})
export class FormatDurationPipe implements PipeTransform {
  transform(seconds: number): string {
    if (seconds == null) {
      return '';
    }
    if (seconds < 60) {
      return `${seconds} sec`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const secondsStr = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
      return `${minutes} min ${secondsStr} sec`;
    }
  }
}
