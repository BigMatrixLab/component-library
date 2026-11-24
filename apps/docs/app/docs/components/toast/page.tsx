import type { Metadata } from 'next';
import { Toaster } from 'ui-kit';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ToastTypes from '@/examples/toast/types';
import ToastPromise from '@/examples/toast/promise';
import ToastAction from '@/examples/toast/action';
import ToastPositions from '@/examples/toast/positions';
import ToastRichColors from '@/examples/toast/rich-colors';
import ToastExpand from '@/examples/toast/expand';
import ToastDuration from '@/examples/toast/duration';
import ToastCloseButton from '@/examples/toast/close-button';
import ToastInDialog from '@/examples/toast/in-dialog';
import ToastJsApi from '@/examples/toast/js-api';

export const metadata: Metadata = { title: 'Toast' };

export default function ToastPage() {
  return (
    <DocPage href="/docs/components/toast">
      {/* The one default Toaster for this page. In your app, mount it once in the root layout. */}
      <Toaster />

      <Section id="types" title="Types">
        <P>
          Mount <Code>{'<Toaster />'}</Code> once, then call <Code>toast()</Code> from anywhere. Each type has its own icon; the loading toast has no timer until you update or dismiss it.
        </P>
        <Example component="toast" file="toast/types" title="Types">
          <ToastTypes />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Confirming something the user just did that needs no further input: saved, sent, copied, deleted (with Undo).',
            'Background results the user is not looking at: an export finished, a deploy failed.',
            <>Progress of a single async task — use <Code>toast.promise</Code>.</>,
          ]}
        />
        <P>Not for: errors the user must fix in a form (put them next to the field), messages that must stay on the page (use an alert), or anything that needs a decision and cannot be missed (use a dialog). Toasts disappear, so never put the only copy of important information in one.</P>
      </Section>

      <Section id="promise" title="Promise">
        <P>
          <Code>toast.promise</Code> shows one toast and morphs it through loading, then success or error. Pass a function to build the message from the result.
        </P>
        <Example component="toast" file="toast/promise" title="Promise">
          <ToastPromise />
        </Example>
      </Section>

      <Section id="action" title="Action and cancel">
        <P>Give a toast one action (and optionally a cancel). Clicking either dismisses it, unless your handler calls <Code>event.preventDefault()</Code>. Keep toasts with actions on screen longer.</P>
        <Example component="toast" file="toast/action" title="Action and cancel">
          <ToastAction />
        </Example>
      </Section>

      <Section id="positions" title="Positions">
        <P>Six positions. New toasts enter from the docked edge, and swiping a toast toward that edge dismisses it. On phones the stack spans the full width.</P>
        <Example component="toast" file="toast/positions" title="Positions" minHeight={200}>
          <ToastPositions />
        </Example>
      </Section>

      <Section id="rich-colors" title="Rich colours">
        <P><Code>richColors</Code> tints each toast by type. Text uses the status <Code>-text</Code> tokens, so contrast holds in light and dark.</P>
        <Example component="toast" file="toast/rich-colors" title="Rich colours">
          <ToastRichColors />
        </Example>
      </Section>

      <Section id="expand" title="Stack and expand">
        <P>By default older toasts tuck behind the newest and the stack expands into a list on hover or focus, using each toast’s measured height. <Code>expand</Code> keeps it open; <Code>visibleToasts</Code> caps how many show.</P>
        <Example component="toast" file="toast/expand" title="Expanded stack">
          <ToastExpand />
        </Example>
      </Section>

      <Section id="duration" title="Duration">
        <P>The default is 4 seconds. The timer pauses on hover, on focus and while the tab is hidden. <Code>Infinity</Code> keeps a toast until it is dismissed.</P>
        <Example component="toast" file="toast/duration" title="Duration">
          <ToastDuration />
        </Example>
      </Section>

      <Section id="close-button" title="Close button">
        <P><Code>closeButton</Code> adds a × to every toast (shown on hover or focus with a mouse, always on touch screens). Set <Code>dismissible: false</Code> on a toast to turn off swipe, the × button and Esc.</P>
        <Example component="toast" file="toast/close-button" title="Close button">
          <ToastCloseButton />
        </Example>
      </Section>

      <Section id="in-dialog" title="Within a dialog">
        <P>The viewport lives in the browser’s top layer (<Code>popover=&quot;manual&quot;</Code>), so toasts show above modal dialogs. While a modal dialog is open the viewport moves inside it so it is not inert: you can still hover, swipe and click toasts.</P>
        <Example component="toast" file="toast/in-dialog" title="Toast within a dialog">
          <ToastInDialog />
        </Example>
      </Section>

      <Section id="js-api" title="JavaScript API">
        <P><Code>toast</Code> is a function, so it works outside components. Calling it again with the same <Code>id</Code> updates that toast in place and restarts its timer.</P>
        <Example component="toast" file="toast/js-api" title="JavaScript API">
          <ToastJsApi />
        </Example>
        <PropsTable
          title="toast(title, options?)"
          rows={[
            { name: 'toast / .success / .error / .warning / .info / .loading', type: '(title, options?) => id', description: 'Create a toast of that type. Returns its id.' },
            { name: 'toast.promise', type: '(promise | () => promise, { loading, success, error, description?, finally? }) => { id, unwrap }', description: 'One toast that morphs through the promise’s states. success and error may be a function.' },
            { name: 'toast.dismiss', type: '(id?) => id', description: 'Dismiss one toast, or all when no id is given.' },
            { name: 'description', type: 'ReactNode', description: 'Second line.' },
            { name: 'duration', type: 'number', default: '4000', description: 'Milliseconds, or Infinity. Loading toasts default to Infinity.' },
            { name: 'action / cancel', type: '{ label, onClick? }', description: 'Buttons. They dismiss the toast unless you preventDefault().' },
            { name: 'icon', type: 'ReactNode | false', description: 'Custom icon, or false for none.' },
            { name: 'id', type: 'string | number', description: 'Reuse an id to update a toast in place.' },
            { name: 'dismissible', type: 'boolean', default: 'true', description: 'Allow swipe, the × button and Esc.' },
            { name: 'important', type: 'boolean', default: 'false', description: 'Announce assertively (role="alert"). Errors always are.' },
            { name: 'closeButton', type: 'boolean', description: 'Show × on this toast, overriding the Toaster.' },
            { name: 'toasterId', type: 'string', description: 'Target the Toaster with this id (only needed with several Toasters).' },
            { name: 'onDismiss / onAutoClose', type: '(toast) => void', description: 'Called when dismissed by anything / by the timer.' },
          ]}
        />
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Toaster"
          rows={[
            { name: 'position', type: "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'", default: "'bottom-right'", description: 'Where the stack docks.' },
            { name: 'visibleToasts', type: 'number', default: '3', description: 'How many toasts show; older ones wait out of sight.' },
            { name: 'expand', type: 'boolean', default: 'false', description: 'Keep the stack expanded.' },
            { name: 'richColors', type: 'boolean', default: 'false', description: 'Tint toasts by type.' },
            { name: 'closeButton', type: 'boolean', default: 'false', description: 'Show × on every toast.' },
            { name: 'gap', type: 'number', default: '14', description: 'Space between expanded toasts, px.' },
            { name: 'offset', type: 'number | string', default: '24px', description: 'Distance from the screen edge (16px on phones).' },
            { name: 'duration', type: 'number', default: '4000', description: 'Default auto-dismiss time, ms.' },
            { name: 'label', type: 'string', default: "'Notifications'", description: 'Accessible name of the region.' },
            { name: 'id', type: 'string', description: 'Name for this Toaster, so toasts can target it with toasterId.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Alt + T', 'Moves focus to the notifications region and expands the stack.'],
            ['F8', 'Same as Alt + T.'],
            ['Tab', 'Moves through the action, cancel and close buttons of the visible toasts.'],
            ['Esc', 'On a toast: dismisses it. On the region: returns focus to where you were.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            <>The viewport is a <Code>region</Code> named “Notifications” and a polite live region, so new toasts are announced without taking focus. Errors and <Code>important</Code> toasts use <Code>role=&quot;alert&quot;</Code> (assertive).</>,
            'Timers pause on hover, on focus and while the tab is hidden, so nothing vanishes while it is being read.',
            'Anything a toast offers must also be reachable elsewhere: toasts time out, so never make one the only way to finish a task.',
            'Toasts that wait behind the visible limit are inert, so they cannot take keyboard focus.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'New toasts rise from their edge with the soft-rise entrance (blur and scale clear); the stack re-settles on the smooth spring.',
            'Exits are faster than entrances. A swipe follows the pointer, then flies out if past 45px or faster than .11px/ms; otherwise it springs back.',
            'Promise toasts morph in place: the icon pops, the text cross-fades and the height follows the content.',
            'Reduced motion: the stack still changes state, the movement does not.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
