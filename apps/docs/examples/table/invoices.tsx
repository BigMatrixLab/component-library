import { Badge, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from 'ui-kit';

const invoices = [
  { id: 'INV-3041', customer: 'Northwind Traders', status: 'paid', due: 'Nov 3, 2025', amount: 4250 },
  { id: 'INV-3042', customer: 'Harbor & Pine', status: 'pending', due: 'Nov 18, 2025', amount: 1840.5 },
  { id: 'INV-3043', customer: 'Lumen Analytics', status: 'paid', due: 'Nov 21, 2025', amount: 12600 },
  { id: 'INV-3044', customer: 'Fieldstone Studio', status: 'overdue', due: 'Oct 29, 2025', amount: 760 },
  { id: 'INV-3045', customer: 'Cobalt Logistics', status: 'pending', due: 'Dec 2, 2025', amount: 3195.25 },
] as const;

const variant = { paid: 'success', pending: 'warning', overdue: 'destructive' } as const;
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

export default function InvoicesTable() {
  return (
    <div className="w-full">
      <Table label="Recent invoices">
        <TableCaption>Invoices issued in the last 30 days.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due</TableHead>
            <TableHead numeric>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{invoice.customer}</TableCell>
              <TableCell>
                <Badge variant={variant[invoice.status]} dot>
                  {invoice.status[0].toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{invoice.due}</TableCell>
              <TableCell numeric>{money.format(invoice.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell numeric>{money.format(total)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
