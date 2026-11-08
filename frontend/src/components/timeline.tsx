import { cn } from 'cn'
import { Icon, type IconName } from '@/components/ui/icon'

export type TimelineStepState = 'done' | 'stopped' | 'todo'

export interface TimelineStep {
  label: string
  /** Second, muted line, e.g. a date or "Not yet". */
  text?: string
  state: TimelineStepState
}

const stateIcon: Record<TimelineStepState, IconName> = {
  done: 'CircleCheck',
  stopped: 'CircleX',
  todo: 'Circle',
}

export interface TimelineProps extends React.ComponentProps<'ol'> {
  steps: TimelineStep[]
}

/** Order progress from the mockup (MK.ui.timeline → .timeline): one icon and
    label per step; done steps green, stopped red, todo muted. Feeds from the
    order status. */
export function Timeline({ steps, className, ...props }: TimelineProps) {
  return (
    <ol data-slot="timeline" className={cn('flex flex-col gap-4', className)} {...props}>
      {steps.map((step, index) => (
        <li
          key={index}
          data-state={step.state}
          className={cn('flex gap-3', step.state === 'todo' ? 'text-text-muted' : 'text-text')}
        >
          <Icon
            name={stateIcon[step.state]}
            className={cn(
              'shrink-0',
              step.state === 'done' && 'text-success',
              step.state === 'stopped' && 'text-danger',
            )}
          />
          <div className="min-w-0 [overflow-wrap:anywhere]">
            <div>{step.label}</div>
            {step.text ? <div className="text-sm text-text-muted">{step.text}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
