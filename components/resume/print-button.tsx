'use client';

import { buttonStyles } from '../ui/button';
import { Printer } from '../ui/icons';

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonStyles({ size: 'sm' })}>
      <Printer /> PDF로 저장
    </button>
  );
}
