import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import AvatarSizes from '@/examples/avatar/sizes';
import AvatarFallbackExample from '@/examples/avatar/fallback';
import AvatarStatus from '@/examples/avatar/status';
import AvatarGroupExample from '@/examples/avatar/group';

export const metadata: Metadata = { title: 'Avatar' };

export default function AvatarPage() {
  return (
    <DocPage href="/docs/components/avatar">
      <Section id="sizes" title="Sizes and shapes">
        <P>Five sizes from 24 to 64px, as a circle for people or a rounded square for organisations and products. Initials scale with the size.</P>
        <Example component="avatar" file="avatar/sizes" title="Sizes and shapes">
          <AvatarSizes />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Identify a person or account: comments, assignees, menus, tables.',
            'Show who is in a group, with a “+N” for the rest.',
            'Show presence with a status dot.',
          ]}
        />
        <P>Not for: decorative images (use an image), or logos that need their own aspect ratio.</P>
      </Section>

      <Section id="fallback" title="Image and fallback">
        <P>
          The fallback is always rendered under the image. If the image fails to load, <Code>AvatarImage</Code> removes itself and the initials show. Use <Code>getInitials(name)</Code> for up to two letters, or put an icon inside.
        </P>
        <Example component="avatar" file="avatar/fallback" title="Image and fallback">
          <AvatarFallbackExample />
        </Example>
      </Section>

      <Section id="status" title="Status">
        <P>A presence dot with a ring in the surface colour. Its colour is status only, and it has an accessible name.</P>
        <Example component="avatar" file="avatar/status" title="Status dot">
          <AvatarStatus />
        </Example>
      </Section>

      <Section id="group" title="Group">
        <P>
          <Code>AvatarGroup</Code> overlaps its avatars with a ring. <Code>max</Code> collapses the rest into “+N”. On a card, set <Code>--ui-avatar-ring</Code> to the card surface so the ring blends in.
        </P>
        <Example component="avatar" file="avatar/group" title="Avatar group">
          <AvatarGroupExample />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Avatar"
          rows={[
            { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: '24 / 32 / 40 / 48 / 64px. Inherited from an AvatarGroup when not set.' },
            { name: 'shape', type: "'circle' | 'rounded'", default: "'circle'", description: 'Rounded square for organisations.' },
            { name: 'status', type: "'online' | 'away' | 'busy' | 'offline'", description: 'Presence dot on the bottom-right.' },
            { name: 'statusLabel', type: 'string', description: 'Accessible name for the dot. Defaults to “Online”…' },
          ]}
        />
        <PropsTable
          title="AvatarImage"
          rows={[
            { name: 'src', type: 'string', description: 'Image URL. Nothing is rendered if it is missing or fails.' },
            { name: 'alt', type: 'string', description: 'Required. The person’s name; "" only if the name is shown beside it.' },
          ]}
        />
        <PropsTable
          title="AvatarGroup"
          rows={[
            { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", description: 'Size for every avatar inside.' },
            { name: 'max', type: 'number', description: 'Show this many, then a “+N” avatar.' },
          ]}
        />
        <P>
          <Code>AvatarFallback</Code> takes initials or an icon. All parts forward <Code>ref</Code>, <Code>className</Code> and native props.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The image’s alt text is the person’s name. When the name is printed next to the avatar, pass alt="" so it is not read twice.',
            'The status dot is role="img" with a label (“Online”), never colour alone.',
            'AvatarGroup is role="group"; give it an aria-label (“Project members”).',
            'Fallback initials are real text and meet 4.5:1 on their fill in light and dark.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'No motion of its own: avatars are static so a list of them stays calm.',
            'Only AvatarImage is a client component (it watches for load errors); Avatar, AvatarFallback and AvatarGroup render on the server.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
