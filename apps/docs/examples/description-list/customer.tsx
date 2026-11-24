import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CopyButton,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from 'ui-kit';

export default function CustomerDetails() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Customer details</CardTitle>
        <CardDescription>Account and billing information for Northwind Traders.</CardDescription>
      </CardHeader>
      <CardContent>
        <DescriptionList orientation="horizontal" divided>
          <DescriptionItem>
            <DescriptionTerm>Primary contact</DescriptionTerm>
            <DescriptionDetails>Amara Okafor</DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Email</DescriptionTerm>
            <DescriptionDetails>
              <a className="underline underline-offset-4" href="mailto:amara.okafor@northwind.example">
                amara.okafor@northwind.example
              </a>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Customer ID</DescriptionTerm>
            <DescriptionDetails>
              <span className="inline-flex items-center gap-1">
                <code className="font-mono text-[13px]">cus_9sK2mQ4xT7</code>
                <CopyButton value="cus_9sK2mQ4xT7" aria-label="Copy customer ID" size="xs" />
              </span>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Plan</DescriptionTerm>
            <DescriptionDetails>
              Scale, billed annually <Badge variant="success">Active</Badge>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Billing address</DescriptionTerm>
            <DescriptionDetails>
              214 Harbor Street, Suite 5
              <br />
              Rotterdam 3011 AB, Netherlands
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Customer since</DescriptionTerm>
            <DescriptionDetails>March 12, 2023</DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Purchase order</DescriptionTerm>
            <DescriptionDetails />
          </DescriptionItem>
        </DescriptionList>
      </CardContent>
    </Card>
  );
}
