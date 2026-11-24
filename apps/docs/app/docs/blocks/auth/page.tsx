import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import AuthSignInSplit from '@/examples/blocks/auth/sign-in-split';
import AuthSignUpCard from '@/examples/blocks/auth/sign-up-card';
import AuthForgotPassword from '@/examples/blocks/auth/forgot-password';
import AuthResetPassword from '@/examples/blocks/auth/reset-password';

export const metadata: Metadata = { title: 'Auth blocks' };

export default function AuthBlocksPage() {
  return (
    <DocPage href="/docs/blocks/auth" wide>
      <Section id="sign-in" title="Sign in, split screen">
        <P>
          A brand panel with a customer quote beside the form. Below roughly 768px of width the panel drops away and the logo moves above the form. Social sign-in sits
          first, then email and password. Errors appear under each field when the form is sent, and focus jumps to the first one.
        </P>
        <Example component="blocks/auth" file="blocks/auth/sign-in-split" title="Sign in, split screen" align="stretch" minHeight={640}>
          <AuthSignInSplit />
        </Example>
      </Section>

      <Section id="sign-up" title="Sign up with email verification">
        <P>
          A centred card on a muted page. After a valid sign-up the card swaps to a 6-digit code step built on <Code>InputOTP</Code>: it verifies as soon as the last
          digit is typed or pasted, and the resend link unlocks after a 30-second countdown.
        </P>
        <Example component="blocks/auth" file="blocks/auth/sign-up-card" title="Sign up with email verification" align="stretch" minHeight={760}>
          <AuthSignUpCard />
        </Example>
      </Section>

      <Section id="forgot-password" title="Forgot password">
        <P>
          Asks for the email, then confirms without saying whether the account exists (so the page can’t be used to probe for accounts). The resend link waits 30
          seconds.
        </P>
        <Example component="blocks/auth" file="blocks/auth/forgot-password" title="Forgot password" align="stretch" minHeight={520}>
          <AuthForgotPassword />
        </Example>
      </Section>

      <Section id="reset-password" title="Reset password">
        <P>
          The page a reset link opens. Requirements tick off as you type and the strength bar follows them; the confirm field checks for a match only on submit, so it
          doesn’t nag while you’re still typing.
        </P>
        <Example component="blocks/auth" file="blocks/auth/reset-password" title="Reset password" align="stretch" minHeight={640}>
          <AuthResetPassword />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Split screen: the main sign-in of a product with a brand to show. Centred card: secondary steps (sign up, verify, reset) and apps embedded in other products.',
            'Keep one primary action per step. Social buttons are outline so they don’t compete with it.',
            'Not for: in-app re-authentication before a sensitive action (use a dialog), or invitation flows that already know the email (prefill and lock it).',
          ]}
        />
      </Section>

      <Section id="behaviour" title="Behaviour">
        <List
          items={[
            <>
              Forms use <Code>noValidate</Code> and validate on submit; messages are specific (“Enter an email like name@company.com”), and typing in a field clears its
              error.
            </>,
            <>
              Buttons show <Code>loading</Code> while the request runs: they keep focus and ignore extra clicks.
            </>,
            'When a step changes, focus moves to the new heading (or to the code field on the verify step), so keyboard and screen-reader users are not left on a removed button.',
            'Autocomplete hints (email, current-password, new-password, one-time-code) let password managers and SMS autofill do their job.',
          ]}
        />
      </Section>

      <Section id="responsive" title="Responsive">
        <List
          items={[
            'Layouts use container queries, so the block adapts to the space it is given, not just the viewport.',
            'Split screen: two columns from 48rem of block width; one column with the logo on top below that.',
            'Cards keep a 28rem maximum width with 16px gutters down to 360px screens; social buttons sit side by side only when both labels fit.',
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Each field is wired through Field: label, hint and error are linked with aria-describedby, and errors set aria-invalid and are announced.',
            'The password reveal button is a toggle (aria-pressed) with an accessible name.',
            'Requirement items say “met” or “not met” to screen readers, not only through colour and icon.',
            'Brand marks on social buttons are decorative; the button text names the provider.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
