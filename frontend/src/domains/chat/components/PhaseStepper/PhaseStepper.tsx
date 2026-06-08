import { Stepper } from '@mantine/core';
import { PHASE_LABELS, PHASE_STEPS, phaseIndex, type Phase } from '../../types';

interface PhaseStepperProps {
  current: Phase;
}

export function PhaseStepper({ current }: PhaseStepperProps) {
  // `active` é o índice do passo em andamento. `done` (todas concluídas)
  // empurra além do último passo, marcando tudo como completo.
  const active = phaseIndex(current);

  return (
    <Stepper active={active} size="xs" iconSize={26} wrap={false} color="terracotta">
      {PHASE_STEPS.map((phase) => (
        <Stepper.Step key={phase} label={PHASE_LABELS[phase]} />
      ))}
    </Stepper>
  );
}
