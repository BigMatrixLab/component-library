'use client';

import {
  Field,
  FieldHint,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from 'ui-kit';

export default function SelectTimezone() {
  return (
    <Field className="w-full max-w-sm">
      <Label>Time zone</Label>
      <Select name="timezone" defaultValue="Europe/London">
        <SelectTrigger placeholder="Select a time zone" />
        <SelectContent>
          <SelectGroup label="Europe">
            <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
            <SelectItem value="Europe/Berlin">Berlin (GMT+1)</SelectItem>
            <SelectItem value="Europe/Athens">Athens (GMT+2)</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup label="North America">
            <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
            <SelectItem value="America/Chicago">Chicago (GMT-6)</SelectItem>
            <SelectItem value="America/Denver">Denver (GMT-7)</SelectItem>
            <SelectItem value="America/Los_Angeles">Los Angeles (GMT-8)</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup label="Asia and Pacific">
            <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
            <SelectItem value="Asia/Kolkata">Mumbai (GMT+5:30)</SelectItem>
            <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
            <SelectItem value="Australia/Sydney">Sydney (GMT+11)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldHint>Meeting invites and digests use this time zone.</FieldHint>
    </Field>
  );
}
