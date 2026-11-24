import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-kit';

const regions = ['Northern Europe', 'Iberia', 'DACH', 'Benelux', 'UK & Ireland', 'Nordics', 'Baltics', 'Italy', 'France', 'Poland', 'Czechia', 'Greece'];

const rows = regions.map((region, i) => ({
  region,
  orders: 1200 + ((i * 937) % 4100),
  revenue: 18400 + ((i * 7919) % 90000),
  growth: ((i * 37) % 180) / 10 - 4,
}));

const number = new Intl.NumberFormat('en-US');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export default function TableVariants() {
  return (
    <div className="w-full">
      {/* Compact + striped + bordered; scrolls inside 288px with the header pinned */}
      <Table compact striped bordered stickyHeader maxHeight={288} label="Sales by region">
        <TableHeader>
          <TableRow>
            <TableHead>Region</TableHead>
            <TableHead numeric>Orders</TableHead>
            <TableHead numeric>Revenue</TableHead>
            <TableHead numeric>Growth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={row.region} selected={i === 2}>
              <TableCell className="font-medium">{row.region}</TableCell>
              <TableCell numeric>{number.format(row.orders)}</TableCell>
              <TableCell numeric>{money.format(row.revenue)}</TableCell>
              <TableCell numeric>{`${row.growth >= 0 ? '+' : '−'}${Math.abs(row.growth).toFixed(1)}%`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
