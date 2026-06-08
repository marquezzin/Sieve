import { Fragment } from 'react';
import { PHASE_LABELS, PHASE_STEPS, phaseIndex, type Phase } from '../../types';
import classes from './PhaseStepper.module.css';

interface PhaseStepperProps {
  current: Phase;
}

function CheckIcon() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function PhaseStepper({ current }: PhaseStepperProps) {
  // `active` é o índice do passo em andamento. `done` (todas concluídas)
  // empurra além do último passo, marcando tudo como completo.
  const active = phaseIndex(current);

  return (
    <div className={classes.track} role="list">
      {PHASE_STEPS.map((phase, i) => {
        const done = i < active;
        const isActive = i === active;
        return (
          <Fragment key={phase}>
            <div
              role="listitem"
              className={`${classes.chip} ${isActive ? classes.chipActive : ''}`}
            >
              <span
                className={`${classes.badge} ${
                  done
                    ? classes.badgeDone
                    : isActive
                      ? classes.badgeActive
                      : classes.badgeTodo
                }`}
              >
                {done ? <CheckIcon /> : i + 1}
              </span>
              <span
                className={`${classes.label} ${
                  isActive
                    ? classes.labelActive
                    : done
                      ? classes.labelDone
                      : classes.labelTodo
                }`}
              >
                {PHASE_LABELS[phase]}
              </span>
            </div>
            {i < PHASE_STEPS.length - 1 && (
              <span
                className={`${classes.connector} ${
                  i < active ? classes.connectorDone : ''
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
