import { useState } from 'react';
import { Button } from './Button.js';
import { copyText } from '../lib/clipboard.js';

interface CopyButtonProps {
  value: string;
  label?: string;
  variant?: 'primary' | 'secondary';
}

export function CopyButton({ value, label = 'СКОПИРОВАТЬ', variant = 'secondary' }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'done'>('idle');

  async function handleCopy() {
    if (await copyText(value)) {
      setState('done');
      setTimeout(() => setState('idle'), 1800);
    } else {
      // Clipboard blocked: show the link so it can be copied by hand.
      globalThis.prompt('Скопируй ссылку', value);
    }
  }

  return (
    <Button type="button" variant={variant} onClick={handleCopy}>
      {state === 'done' ? 'СКОПИРОВАНО' : label}
    </Button>
  );
}
