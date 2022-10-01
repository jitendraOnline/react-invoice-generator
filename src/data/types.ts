import { CSSProperties } from 'react'

export interface ProductLine {
  itemNameNew:string
  description: string
  quantity: string
  rate: string
  productId?:string
}

export interface Invoice {
  logo: string;
  logoWidth: number;
  title: string;
  companyName: string;
  name: string;
  companyAddress: string;
  companyAddress2: string;
  companyCountry: string;

  clientId?: string;
  billTo: string;
  clientName: string;
  clientAddress: string;
  clientAddress2: string;
  clientCountry: string;
  collectedBy?:string;

  invoiceTitleLabel: string;
  invoiceTitle: string;
  invoiceDateLabel: string;
  invoiceDate: string;
  invoiceDueDateLabel: string;
  invoiceDueDate: string;

  productLineDescription: string;
  productLineQuantity: string;
  productLineQuantityRate: string;
  productLineQuantityAmount: string;

  productLines: ProductLine[];

  subTotalLabel: string;
  taxLabel: string;

  totalLabel: string;
  currency: string;

  notesLabel: string;
  notes: string;
  termLabel: string;
  term: string;

  paymentType: string;
  id?: string;
  isDeleted?: boolean;
  partialAmountPaid?: string;
}

export interface ProductType{
  value:string
  text:string
  cost_cash:any
  cost:any
  purchasePrice?:any
  id?:any
  isDeleted?:boolean
}

export interface CSSClasses {
  [key: string]: CSSProperties
}
