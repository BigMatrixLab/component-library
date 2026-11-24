import { TextShimmer } from 'ui-kit';

export default function TextShimmerVariants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <TextShimmer asChild>
        <h3 className="text-xl font-semibold tracking-tight">Generating your Q4 report</h3>
      </TextShimmer>
      <p className="text-sm">
        <TextShimmer>Searching 1,284 documents</TextShimmer>
      </p>
      <p className="text-sm">
        <TextShimmer duration={3200}>Syncing with Google Calendar — slower sweep</TextShimmer>
      </p>
    </div>
  );
}
