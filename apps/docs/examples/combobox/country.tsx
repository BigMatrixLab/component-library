'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  Field,
  FieldHint,
  Label,
} from 'ui-kit';

const countries = [
  ['AT', 'Austria', 'Europe'],
  ['BE', 'Belgium', 'Europe'],
  ['CA', 'Canada', 'Americas'],
  ['CH', 'Switzerland', 'Europe'],
  ['CO', 'Colombia', 'Americas'],
  ['CZ', 'Czechia', 'Europe'],
  ['DE', 'Germany', 'Europe'],
  ['ES', 'Spain', 'Europe'],
  ['FR', 'France', 'Europe'],
  ['IE', 'Ireland', 'Europe'],
  ['IN', 'India', 'Asia and Pacific'],
  ['JP', 'Japan', 'Asia and Pacific'],
  ['MX', 'Mexico', 'Americas'],
  ['NZ', 'New Zealand', 'Asia and Pacific'],
  ['PL', 'Poland', 'Europe'],
  ['SE', 'Sweden', 'Europe'],
  ['TR', 'Türkiye', 'Europe'],
  ['US', 'United States', 'Americas'],
] as const;

const regions = ['Europe', 'Americas', 'Asia and Pacific'];

export default function ComboboxCountry() {
  return (
    <Field className="w-full max-w-sm">
      <Label>Billing country</Label>
      <Combobox name="country" defaultValue="IE">
        <ComboboxInput placeholder="Search countries" clearable />
        <ComboboxContent>
          {regions.map((region) => (
            <ComboboxGroup key={region} label={region}>
              {countries
                .filter(([, , r]) => r === region)
                .map(([code, name]) => (
                  <ComboboxItem key={code} value={code}>
                    {name}
                  </ComboboxItem>
                ))}
            </ComboboxGroup>
          ))}
          <ComboboxEmpty>No country matches your search.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
      <FieldHint>Used for tax and invoice formatting. Try typing “turk” or “ire”.</FieldHint>
    </Field>
  );
}
