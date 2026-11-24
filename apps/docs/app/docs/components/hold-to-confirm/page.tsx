import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import HoldToConfirmDeleteWorkspace from '@/examples/hold-to-confirm/delete-workspace';
import HoldToConfirmDuration from '@/examples/hold-to-confirm/duration';

export const metadata: Metadata = { title: 'Hold to confirm' };

export default function HoldToConfirmPage() {
  return (
    <DocPage href="/docs/components/hold-to-confirm">
      <Section id="delete-workspace" title="Delete a workspace">
        <P>Press and hold the button. A red fill sweeps across; let go early and it drains back. Hold it through and a check pops. A quick click does nothing.</P>
        <Example component="hold-to-confirm" file="hold-to-confirm/delete-workspace" title="Delete a workspace">
          <HoldToConfirmDeleteWorkspace />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Destructive or irreversible actions where a confirmation dialog would be too heavy: delete a workspace, revoke a key, close an account.',
            'Touch and pointer interfaces where a double-click guard would be easy to trip.',
            <>If the user should read what they are about to lose, a dialog or <Code>ConfirmMorph</Code> is a better fit — holding confirms intent, not understanding.</>,
          ]}
        />
      </Section>

      <Section id="duration" title="Duration and sizes">
        <P>The default is 1.2 seconds. Shorten it for low-stakes actions, lengthen it for the ones that really matter. The accessible description updates with it.</P>
        <Example component="hold-to-confirm" file="hold-to-confirm/duration" title="Duration and sizes">
          <HoldToConfirmDuration />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="HoldToConfirm"
          rows={[
            { name: 'onConfirm', type: '() => void', description: 'Called once, when the hold completes.' },
            { name: 'duration', type: 'number', default: '1200', description: 'Milliseconds to hold.' },
            { name: 'doneLabel', type: 'ReactNode', default: "'Deleted'", description: 'Label after completing.' },
            { name: 'leadingIcon', type: 'ReactNode', description: 'Icon before the label.' },
            { name: 'description', type: 'string', description: 'Accessible description. Defaults to "Press and hold for N seconds to confirm."' },
            { name: 'resetAfter', type: 'number', default: '1600', description: 'Milliseconds before returning to idle. 0 keeps it done.' },
            { name: 'onHoldStart / onHoldCancel', type: '() => void', description: 'The hold began / was released early.' },
            { name: 'variant, size', type: 'ButtonProps', default: "'outline'", description: 'Same as Button. The fill is always the destructive colour, so outline, ghost or secondary read best.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Space (hold)', 'Starts the hold; releasing early cancels.'],
            ['Enter (hold)', 'Same as Space.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A native button described by an accessible text: “Press and hold for 1.2 seconds to confirm. Release early to cancel.”',
            'Keyboard users hold Space or Enter; losing focus or moving the pointer off the button cancels.',
            'Assistive technology that activates the button with a plain click (no key, no pointer) starts a full timed hold, so nothing is unreachable — it still cannot confirm instantly.',
            'The result is announced through a polite live region. Text keeps contrast on both halves of the sweep: destructive text on the surface, destructive foreground on the fill.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            <>Press: the button sinks to scale .97 on <Code>--ui-spring-snappy</Code> while held (pointer or keyboard).</>,
            'Fill: a clipped copy of the label on the destructive fill is revealed left to right with a linear clip-path animation lasting exactly `duration`, so the text is never squashed.',
            'Release early: the fill drains back from where it was in 160–420ms (longer the further it got), ease-out.',
            'Done: the button pops 0.97 → 1.035 → 1 over 360ms, the label morphs (width spring 550ms, 2px-blur crossfade) and the check draws in 320ms.',
            'Reduced motion: the fill still tracks the hold (it is the state), but there is no press scale, no pop, no drain and the label swaps with a 1ms fade.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
