import { PrinterTypes, ThermalPrinter } from 'node-thermal-printer';

interface ReceiptPayload {
  invoiceNumber: string;
  lines: Array<{ name: string; quantity: number; price: number }>;
}

const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: process.env.PRINTER_INTERFACE ?? 'tcp://127.0.0.1:9100',
  width: Number(process.env.PRINTER_WIDTH_MM ?? 58)
});

export const printReceipt = async (payload: ReceiptPayload) => {
  printer.clear();
  printer.alignCenter();
  printer.println('GARMENT POS');
  printer.println(`Invoice: ${payload.invoiceNumber}`);
  printer.drawLine();
  printer.alignLeft();

  payload.lines.forEach((line) => {
    printer.leftRight(`${line.name} x${line.quantity}`, line.price.toFixed(2));
  });

  printer.drawLine();
  const total = payload.lines.reduce((acc, line) => acc + line.quantity * line.price, 0);
  printer.leftRight('Total', total.toFixed(2));
  printer.newLine();
  printer.alignCenter();
  printer.println('Thank you!');
  printer.cut();

  const isConnected = await printer.isPrinterConnected();
  if (!isConnected) {
    throw new Error('Printer not connected');
  }

  await printer.execute();
};
