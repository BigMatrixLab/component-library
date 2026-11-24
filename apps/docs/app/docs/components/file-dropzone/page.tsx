import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import FileDropzoneDocuments from '@/examples/file-dropzone/documents';
import FileDropzoneAvatar from '@/examples/file-dropzone/avatar';

export const metadata: Metadata = { title: 'File dropzone' };

export default function FileDropzonePage() {
  return (
    <DocPage href="/docs/components/file-dropzone">
      <Section id="usage" title="Usage">
        <P>
          A large dashed target for dropping files or clicking to browse, with a real <Code>&lt;input type="file"&gt;</Code> behind it and a list of the picked files. It validates but never uploads: react to <Code>onFilesChange</Code> and feed progress back through <Code>fileStatus</Code>.
        </P>
        <Example component="file-dropzone" file="file-dropzone/documents" title="Documents with progress">
          <FileDropzoneDocuments />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Attachments, documents, imports and any upload where drag and drop saves time.',
            <>One file, such as an avatar: leave <Code>multiple</Code> off and a new pick replaces the old.</>,
          ]}
        />
        <P>Not for: a single quick pick inside a dense form (a plain file input is enough).</P>
      </Section>

      <Section id="rules" title="Rules and errors">
        <P>
          <Code>accept</Code>, <Code>maxSize</Code> (bytes) and <Code>maxFiles</Code> are checked on every drop or pick. Valid files are added; each broken rule becomes an error row naming the file and the limit, announced to screen readers and dismissible. The rules text under the title is built from the same props.
        </P>
        <Example component="file-dropzone" file="file-dropzone/avatar" title="Single image, compact">
          <FileDropzoneAvatar />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="FileDropzone"
          rows={[
            { name: 'value / defaultValue', type: 'File[]', default: '[]', description: 'Controlled / initial list of files.' },
            { name: 'onFilesChange', type: '(files: File[]) => void', description: 'Called with the full list when a file is added or removed.' },
            { name: 'onReject', type: '(rejections: FileRejection[]) => void', description: "Each has file, code ('invalid-type', 'too-large', 'too-many') and a message." },
            { name: 'accept', type: 'string', description: 'Like <input accept>: ".pdf,.docx" or "image/*".' },
            { name: 'multiple', type: 'boolean', default: 'false', description: 'Several files. Off: a new pick replaces the old file.' },
            { name: 'maxSize / maxFiles', type: 'number', description: 'Largest file in bytes; most files in the list.' },
            { name: 'fileStatus', type: '(file: File) => FileStatusInfo', description: '{ status: idle | uploading | success | error, progress?, message? } per file.' },
            { name: 'renderFileExtra', type: '(file: File) => ReactNode', description: 'Content under a file name, e.g. a retry button.' },
            { name: 'title / rules / icon', type: 'ReactNode / ReactNode / IconName', description: 'Text and icon in the target. rules={null} hides the rules line.' },
            { name: 'variant', type: "'default' | 'compact'", default: "'default'", description: 'Compact is one row.' },
            { name: 'showList / previews', type: 'boolean', default: 'true', description: 'Show the file list; show image thumbnails (object URLs, revoked on removal).' },
            { name: 'name', type: 'string', description: 'Syncs the files into the real input so a form submits them.' },
            { name: 'disabled', type: 'boolean', description: 'Also set by a disabled Field.' },
            { name: 'removeLabel', type: '(file: File) => string', description: 'Accessible name of a row remove button.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Focuses the drop target, then each remove button.'],
            ['Enter / Space on target', 'On the target, opens the file picker.'],
            ['Enter / Space on ×', 'On a remove button, removes the file and returns focus to the target.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The target is a button named by its title and described by the rules text, so the limits are read before the picker opens.',
            'The real file input is hidden from assistive technology and out of the tab order; the target drives it.',
            'Error rows use role="alert". Each progress bar is named after its file; the remove button names the file it removes.',
            'Drag and drop is an extra: everything it does is also possible with the keyboard and the picker.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Dragging over the target tints it with the primary colour and scales it to 1.01 on the snappy spring; the icon lifts 2px.',
            'File and error rows rise in; progress glides on the smooth spring. Reduced motion keeps the colour change only.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
