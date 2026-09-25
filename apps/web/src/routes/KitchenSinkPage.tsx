import { useState } from 'react';
import { Button } from '../primitives/Button.js';
import { Input } from '../primitives/Input.js';
import { Chip } from '../primitives/Chip.js';
import { Banner } from '../primitives/Banner.js';
import { CopyButton } from '../primitives/CopyButton.js';
import { TimeInput } from '../primitives/TimeInput.js';
import { HourRuler } from '../features/create/HourRuler.js';
import { emptyQuarters, setRange } from '../features/create/ranges.js';
import styles from './KitchenSinkPage.module.css';

export function KitchenSinkPage() {
  const [chipActive, setChipActive] = useState(0);
  const [time, setTime] = useState(9 * 60);
  const [quarters, setQuarters] = useState(() => setRange(emptyQuarters(), { start: 600, end: 900 }, true));

  return (
    <div className={styles.page}>
      <h1>КИТ ПРИМИТИВОВ</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>КНОПКИ</h2>
        <div className={styles.row}>
          <Button variant="primary">ПЕРВИЧНАЯ</Button>
          <Button variant="secondary">ВТОРИЧНАЯ</Button>
          <Button variant="ghost">ПРИЗРАЧНАЯ</Button>
          <Button variant="primary" disabled>
            НЕАКТИВНА
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ПОЛЯ</h2>
        <div className={styles.fieldGrid}>
          <div>
            <Input aria-label="Текстовое поле" placeholder="Введите значение" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ЧИПЫ</h2>
        <div className={styles.row}>
          {['15 МИН', '30 МИН', '1 ЧАС'].map((label, i) => (
            <Chip key={label} active={chipActive === i} onClick={() => setChipActive(i)}>
              {label}
            </Chip>
          ))}
        </div>
      </section>



      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>БАННЕРЫ</h2>
        <div className={styles.stack}>
          <Banner>Обычное сообщение.</Banner>
          <Banner variant="error">Сообщение об ошибке.</Banner>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>КНОПКА КОПИРОВАНИЯ</h2>
        <CopyButton value="https://cal.borozdov.ru/p/demo" />
      </section>



      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ВРЕМЯ — ВВОД ЦИФРАМИ</h2>
        <TimeInput value={time} onChange={setTime} ariaLabel="Время" />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ЛИНЕЙКА ЧАСОВ</h2>
        <HourRuler value={quarters} onChange={setQuarters} />
      </section>




      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ЧИСЛА</h2>
        <p className={['num', styles.bigNumber].join(' ')}>1 234 567</p>
      </section>
    </div>
  );
}
