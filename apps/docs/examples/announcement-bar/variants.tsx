import { AnnouncementBar, AnnouncementBarBadge, AnnouncementBarLink, Icon } from 'ui-kit';

export default function AnnouncementBarVariants() {
  return (
    <div className="grid w-full gap-3">
      <AnnouncementBar
        aria-label="Maintenance notice"
        icon={<Icon name="clock" />}
        action={<AnnouncementBarLink href="#status">Status page</AnnouncementBarLink>}
      >
        Scheduled maintenance on Sunday 30 November, 02:00–03:00 UTC.
      </AnnouncementBar>
      <AnnouncementBar
        variant="primary"
        aria-label="Product launch"
        icon={<AnnouncementBarBadge>New</AnnouncementBarBadge>}
        action={<AnnouncementBarLink href="#changelog">Read the changelog</AnnouncementBarLink>}
      >
        Usage-based billing is live for every workspace.
      </AnnouncementBar>
      <AnnouncementBar
        variant="gradient-subtle"
        aria-label="Event"
        icon={<Icon name="sparkles" />}
        action={<AnnouncementBarLink href="#register">Save your seat</AnnouncementBarLink>}
      >
        <strong>Northwind Live</strong> — 4 December, online and free.
      </AnnouncementBar>
    </div>
  );
}
