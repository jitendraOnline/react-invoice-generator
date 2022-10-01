import { format } from 'date-fns'
import { ProductLine, Invoice } from './types'

export const initialProductLine: ProductLine = {
  description: '',
  quantity: '1',
  rate: '0.00',
  itemNameNew:'',
  productId:'',
}
const dateFormat = 'MMM dd, yyyy';
export const companyName =  "OM SAI KRISHI SEVA KENDRA";


//Deepak invoice
export const initialInvoice: Invoice = {
  logo: '',
  logoWidth: 100,
  title: 'INVOICE',
  companyName: 'OM SAI KRISHI SEVA KENDRA',
  name: 'Deepak Patel',
  companyAddress: 'Veer Savarkar, Ward number 8, Bankhedi',
  companyAddress2: 'Phone No. : 8878081111,',
  companyCountry: 'India',
  billTo: 'Bill To:',
  clientName: '',
  clientAddress: '',
  clientAddress2: '',
  collectedBy:'',
  clientCountry: 'India',
  invoiceTitleLabel: 'Invoice#',
  invoiceTitle: '',
  invoiceDateLabel: 'Invoice Date',
  invoiceDate: format(new Date(), dateFormat),
  invoiceDueDateLabel: 'Due Date',
  invoiceDueDate: '',
  productLineDescription: 'Item Description',
  productLineQuantity: 'Qty',
  productLineQuantityRate: 'Rate',
  productLineQuantityAmount: 'Amount',
  productLines: [
    { ...initialProductLine },
  ],
  subTotalLabel: 'Sub Total',
  taxLabel: 'Sale Tax (1%)',
  totalLabel: 'TOTAL',
  currency: '₹',
  notesLabel: 'Notes',
  notes: 'It was great doing business with you.',
  termLabel: 'Terms & Conditions',
  term: 'Please make the payment by the due date.',
  paymentType:'Cash',
  partialAmountPaid:'0',
}


//Manoj invoice
export const initialInvoiceOriginal: Invoice = {
  logo: '',
  logoWidth: 100,
  title: 'INVOICE',
  companyName: 'OM KRISHI SEVA KENDRA', //change the company name.
  name: 'Manoj Patel',
  companyAddress: 'Near Bus stand, Chandon',
  companyAddress2: 'Phone No. : 6267017413',
  companyCountry: 'India',
  billTo: 'Bill To:',
  clientName: '',
  clientAddress: '',
  clientAddress2: '',
  clientCountry: 'India',
  invoiceTitleLabel: 'Invoice#',
  invoiceTitle: '',
  invoiceDateLabel: 'Invoice Date',
  invoiceDate: format(new Date(), dateFormat),
  invoiceDueDateLabel: 'Due Date',
  invoiceDueDate: '',
  productLineDescription: 'Item Description',
  productLineQuantity: 'Qty',
  productLineQuantityRate: 'Rate',
  productLineQuantityAmount: 'Amount',
  productLines: [
    { ...initialProductLine },
    { ...initialProductLine },
  ],
  subTotalLabel: 'Sub Total',
  taxLabel: 'Sale Tax (1%)',
  totalLabel: 'TOTAL',
  currency: '₹',
  notesLabel: 'Notes',
  notes: 'It was great doing business with you.',
  termLabel: 'Terms & Conditions',
  term: 'Please make the payment by the due date.',
  paymentType:'Cash',
  partialAmountPaid:'0',
}