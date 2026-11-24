import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from 'ui-kit';

export default function StackedDetails() {
  return (
    <div className="grid w-full gap-8 sm:grid-cols-2">
      <DescriptionList>
        <DescriptionItem>
          <DescriptionTerm>Invoice number</DescriptionTerm>
          <DescriptionDetails>INV-3041</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Issued</DescriptionTerm>
          <DescriptionDetails>October 20, 2025</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Due</DescriptionTerm>
          <DescriptionDetails>November 3, 2025</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
      <DescriptionList>
        <DescriptionItem>
          <DescriptionTerm>Billed to</DescriptionTerm>
          <DescriptionDetails>Northwind Traders</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Payment method</DescriptionTerm>
          <DescriptionDetails>Visa ending in 4242</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Total</DescriptionTerm>
          <DescriptionDetails>$4,250.00</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
    </div>
  );
}
