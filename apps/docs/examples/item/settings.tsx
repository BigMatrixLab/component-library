import { Avatar, AvatarFallback, Badge, Button, Icon, Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle, Switch } from 'ui-kit';

export default function ItemSettings() {
  return (
    <ItemGroup variant="outline" className="w-full max-w-xl" aria-label="Account settings">
      <Item>
        <ItemMedia variant="icon">
          <Icon name="mail" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Email notifications</ItemTitle>
          <ItemDescription>Weekly summary and billing receipts to amina@northwind.example.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Switch aria-label="Email notifications" defaultChecked />
        </ItemActions>
      </Item>
      <Item>
        <ItemMedia variant="icon">
          <Icon name="lock" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            Two-factor authentication <Badge variant="success" size="sm">On</Badge>
          </ItemTitle>
          <ItemDescription>Authenticator app, set up on 3 March 2026.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Manage
          </Button>
        </ItemActions>
      </Item>
      <Item>
        <ItemMedia>
          <Avatar>
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Amina Rahman</ItemTitle>
          <ItemDescription>Owner of Northwind Finance. Joined in 2024.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="ghost">
            Edit profile
          </Button>
        </ItemActions>
      </Item>
      <Item>
        <ItemMedia variant="icon">
          <Icon name="trash" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Delete workspace</ItemTitle>
          <ItemDescription>Removes all projects, members and invoices. This cannot be undone.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="destructive">
            Delete
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  );
}
