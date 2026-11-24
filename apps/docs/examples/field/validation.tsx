'use client';

import { useState } from 'react';
import { Button, Field, FieldError, FieldHint, Form, Input, Label, PasswordInput } from 'ui-kit';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FieldValidation() {
  const [email, setEmail] = useState('ada@northwind');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: true, password: false });
  const [done, setDone] = useState(false);

  const emailError = touched.email && !emailPattern.test(email) ? 'Enter an email like ada@northwind.com.' : '';
  const passwordError = touched.password && password.length < 12 ? 'Use at least 12 characters.' : '';

  return (
    <Form
      className="w-full max-w-sm"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        setDone(emailPattern.test(email) && password.length >= 12);
      }}
    >
      <Field required>
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setDone(false);
          }}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        />
        <FieldError>{emailError}</FieldError>
      </Field>
      <Field required>
        <Label>Password</Label>
        <PasswordInput
          value={password}
          autoComplete="new-password"
          onChange={(e) => {
            setPassword(e.target.value);
            setDone(false);
          }}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        />
        <FieldHint>Longer is stronger. A short sentence works well.</FieldHint>
        <FieldError>{passwordError}</FieldError>
      </Field>
      <Button type="submit">Create account</Button>
      {done && (
        <p role="status" className="text-sm text-success-text">
          Account created for {email}.
        </p>
      )}
    </Form>
  );
}
