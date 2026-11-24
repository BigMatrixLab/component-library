import { Icon, Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemMeta, ItemTitle } from 'ui-kit';

export default function ItemVariants() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Item>
        <ItemMedia variant="icon">
          <Icon name="file" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Default</ItemTitle>
          <ItemDescription>No container; sits on whatever surface holds it.</ItemDescription>
        </ItemContent>
        <ItemMeta>2.4 MB</ItemMeta>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Icon name="file" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Outline</ItemTitle>
          <ItemDescription>A 1px border, for rows that stand alone.</ItemDescription>
        </ItemContent>
        <ItemMeta>2.4 MB</ItemMeta>
      </Item>
      <Item variant="muted">
        <ItemMedia variant="icon">
          <Icon name="file" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Muted</ItemTitle>
          <ItemDescription>A quiet filled well for secondary information.</ItemDescription>
        </ItemContent>
        <ItemMeta>2.4 MB</ItemMeta>
      </Item>
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Icon name="folder" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Small</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Icon name="chevron-right" className="text-muted-foreground" />
        </ItemActions>
      </Item>
      <Item variant="outline" size="lg">
        <ItemMedia variant="icon">
          <Icon name="folder" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Large</ItemTitle>
          <ItemDescription>More padding and a larger title for primary lists.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Icon name="chevron-right" className="text-muted-foreground" />
        </ItemActions>
      </Item>
    </div>
  );
}
