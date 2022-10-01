import React, { FC, useState, useEffect } from "react";
import { Invoice, ProductLine } from "../data/types";
import { initialInvoice, initialProductLine } from "../data/initialData";
import EditableInput from "./EditableInput";
import EditableSelect from "./EditableSelect";
import EditableTextarea from "./EditableTextarea";
import EditableCalendarInput from "./EditableCalendarInput";

import Document from "./Document";
import Page from "./Page";
import View from "./View";
import Text from "./Text";
import { Font } from "@react-pdf/renderer";
import Download from "./DownloadPDF";
import format from "date-fns/format";
import { addDepositData } from "../storage/deposits";
import InvoiceList from "./invoiceList";
import { sumProductLines } from "../storage/invoice";
import { auth } from "../storage/serverOperation";
import { addInventoryData } from "../storage/inventory";
import { displayCurrency } from "../utils";

Font.register({
  family: "Nunito",
  fonts: [
    { src: "https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf" },
    {
      src: "https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf",
      fontWeight: 600,
    },
  ],
});

interface Props {
  data?: any;
  pdfMode?: boolean;
  addInvoiceData?: any;
  productList?: any;
  productListForDropDown?: any;
  showInvoiceList?: any;
  updateInvoiceData?: any;
  navigateToScreen?: any;
  hideReturn?:any;
}

const InvoicePageReturn: FC<Props> = ({
  data,
  pdfMode,
  productListForDropDown,
  productList,
  hideReturn,
}) => {
  const [invoice, setInvoice] = useState<Invoice>(
    data
      ? { ...data }
      : { ...initialInvoice, invoiceTitle: "INV" + new Date().getTime() }
  );
  const [subTotal, setSubTotal] = useState<number>();
  const [saleTax, setSaleTax] = useState<number>();
  useEffect(() => {
    if (data) {
      if (!data.id) {
        const data1 = { ...data, invoiceTitle: "INV" + new Date().getTime() };
        setInvoice(data1);
      } else {
        if (!data.partialAmountPaid) {
          data.partialAmountPaid = "0";
        }
        setInvoice({ ...data });
      }
    }
  }, [data]);

  const dateFormat = "MMM dd, yyyy";
  const invoiceDate =
    invoice.invoiceDate !== "" ? new Date(invoice.invoiceDate) : new Date();
  const invoiceDueDate =
    invoice.invoiceDueDate !== ""
      ? new Date(invoice.invoiceDueDate)
      : new Date(invoiceDate.valueOf());

  if (invoice.invoiceDueDate === "") {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 30);
  }

  const handlePaymentChange = (paymentType: string) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      const newProductLine = { ...productLine };
      productList.forEach((data: any) => {
        if (data.value + "" === newProductLine.itemNameNew) {
          //newProductLine[name] = value;
          newProductLine["description"] = data.text;
          if (paymentType === "Cash") {
            newProductLine["rate"] = data.cost_cash + "";
          } else {
            newProductLine["rate"] = data.cost + "";
          }
        }
      });
      return newProductLine;
    });
    setInvoice({ ...invoice, productLines, paymentType: paymentType });
  };

  const handleChange = (name: keyof Invoice, value: string | number) => {
    if (name !== "productLines") {
      const newInvoice = { ...invoice };

      if (name === "logoWidth" && typeof value === "number") {
        newInvoice[name] = value;
      } else if (
        name !== "logoWidth" &&
        name !== "isDeleted" &&
        typeof value === "string"
      ) {
        newInvoice[name] = value;
      }
      setInvoice(newInvoice);
      setTimeout(() => {
        if (name === "paymentType") {
          handlePaymentChange(value + "");
        }
      }, 1);
    }
  };

  const handleProductLineChange = (
    index: number,
    name: keyof ProductLine,
    value: string
  ) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine };

        if (name === "description") {
          newProductLine[name] = value;
        } else if (name === "itemNameNew") {
          productList.forEach((data: any) => {
            if (data.value + "" === value) {
              newProductLine[name] = value;
              newProductLine["description"] = data.text;
              newProductLine["productId"] = data.id;
              if (invoice.paymentType === "Cash") {
                newProductLine["rate"] = data.cost_cash + "";
              } else {
                newProductLine["rate"] = data.cost + "";
              }
            }
          });
        } else {
          if (
            value[value.length - 1] === "." ||
            (value[value.length - 1] === "0" && value.includes("."))
          ) {
            newProductLine[name] = value;
          } else {
            const n = parseFloat(value);

            newProductLine[name] = (n ? n : 0).toString();
          }
        }

        return newProductLine;
      }

      return { ...productLine };
    });

    setInvoice({ ...invoice, productLines });
  };

  const handleRemove = (i: number) => {
    const productLines = invoice.productLines.filter(
      (productLine, index) => index !== i
    );

    setInvoice({ ...invoice, productLines });
  };

  const handleAdd = () => {
    const productLines = [...invoice.productLines, { ...initialProductLine }];

    setInvoice({ ...invoice, productLines });
  };

  const calculateAmount = (quantity: string, rate: string) => {
    const quantityNumber = parseFloat(quantity);
    const rateNumber = parseFloat(rate);
    const amount =
      quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;

    return amount.toFixed(2);
  };

  useEffect(() => {
    let subTotal = 0;

    invoice.productLines.forEach((productLine) => {
      const quantityNumber = parseFloat(productLine.quantity);
      const rateNumber = parseFloat(productLine.rate);
      const amount =
        quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;

      subTotal += amount;
    });

    setSubTotal(subTotal);
  }, [invoice.productLines]);

  useEffect(() => {
    const match = invoice.taxLabel.match(/(\d+)%/);
    const taxRate = match ? parseFloat(match[1]) : 0;
    const saleTax = subTotal ? (subTotal * taxRate) / 100 : 0;
    setSaleTax(saleTax);
  }, [subTotal, invoice.taxLabel, invoice.partialAmountPaid]);

  const saveInvoice = (event: any) => {
    let invoice1 = sumProductLines(invoice);
    let deposit = {
      type: "return",
      clientName: invoice1.clientName,
      clientId: invoice1.clientId,
      amount: invoice1.totalAmount || 0,
      dateOfDeposit: new Date(),
      depositer: "Items Returned(Invoice)",
      paymentMode: invoice.paymentType,
      accountNumber: "",
      bank: "",
      notes: "this is deposited by invoice return.",
    };
    addDeposit(deposit);
  };

  const addDeposit = (depositState: any) => {
    if (
      depositState &&
      depositState.amount &&
      depositState.clientId &&
      depositState.clientName
    ) {
      let preproccessedObject = {
        ...depositState,
        amount: parseInt("" + depositState.amount),
      };
      addDepositData(preproccessedObject)
        .then(() => {
          // alert("Amount is reversed.");
          return addInventoryAfterInvoice(invoice);
        })
        .catch(() => {
          alert("Unable to return items.");
        });
    } else {
      alert("Please add item to return.");
    }
  };

  const addInventoryAfterInvoice = (data: any) => {
    const promiseList: any = [];
    data.productLines
      .filter((obj: any) => {
        return obj.productId;
      })
      .forEach((product: any) => {
        let negativeInventory = {
          type: "return",
          quantity: parseInt(product.quantity) || 0,
          productId: product.productId,
          expiryDate: new Date(),
          productName: product.itemNameNew,
          shopNumber:
            auth.currentUser?.email?.indexOf("admin") === -1 ? "2" : "1",
          invoiceId: "",
          notes: "inventory added for returned item",
          clientName: invoice.clientName,
          clientId: invoice.clientId,
          //invoice:data,
        };
        promiseList.push(addInventoryData(negativeInventory));
      });
    return Promise.all(promiseList)
      .then((values) => {
        alert(
          "Success:-items added to inventory and updated user amount. Please refresh."
        );
        hideReturn(false);
      })
      .then(() => {
        return { status: "Done" };
      })
      .catch(() => {
        alert("Unable to add inventory.");
      });
  };

  return (
    <Document pdfMode={pdfMode}>
      <Page className="invoice-wrapper" pdfMode={pdfMode}>
        <View className="flex mb-10" pdfMode={pdfMode}>
          <View className="w-40" pdfMode={pdfMode}>
            <EditableInput
              className="bold"
              value={"Payment Type"}
              onChange={(value) => handleChange("invoiceTitleLabel", value)}
              pdfMode={pdfMode}
            />
          </View>
          <div style={{border:'1px soild green',display:'flex'}}>
            
              <EditableSelect
                options={[
                  { value: "Cash", text: "Cash" },
                  { value: "Credit", text: "Credit" },
                ]}
                value={invoice.paymentType}
                onChange={(value) => handleChange("paymentType", value)}
                pdfMode={pdfMode}
              />
            
          </div>
        </View>

        <View className="mt-10 bg-dark flex" pdfMode={pdfMode}>
          {/* <View className="w-48 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold"
              value={'Product Code'}
              //onChange={(value) => handleChange('itemNameNew', value)}
              pdfMode={pdfMode}
            />
          </View> */}
          <View className="w-48 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold"
              value={"Product Name"}
              // value={invoice.productLineDescription}
              // onChange={(value) => handleChange('productLineDescription', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantity}
              onChange={(value) => handleChange("productLineQuantity", value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityRate}
              onChange={(value) =>
                handleChange("productLineQuantityRate", value)
              }
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-18 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityAmount}
              onChange={(value) =>
                handleChange("productLineQuantityAmount", value)
              }
              pdfMode={pdfMode}
            />
          </View>
        </View>
        {invoice.productLines.map((productLine, i) => {
          return pdfMode && productLine.description === "" ? (
            <Text key={productLine?.productId || i}></Text>
          ) : (
            <View
              key={productLine?.productId || i}
              className="row flex"
              pdfMode={pdfMode}
            >
              <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableSelect
                  options={productListForDropDown}
                  value={productLine.itemNameNew}
                  onChange={(value) =>
                    handleProductLineChange(i, "itemNameNew", value)
                  }
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.quantity}
                  onChange={(value) =>
                    handleProductLineChange(i, "quantity", value)
                  }
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.rate}
                  onChange={(value) =>
                    handleProductLineChange(i, "rate", value)
                  }
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-18 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark right" pdfMode={pdfMode}>
                  {calculateAmount(productLine.quantity, productLine.rate)}
                </Text>
              </View>
              {!pdfMode && (
                <button
                  className="link row__remove"
                  aria-label="Remove Row"
                  title="Remove Row"
                  onClick={() => handleRemove(i)}
                >
                  <span className="icon icon-remove bg-red"></span>
                </button>
              )}
            </View>
          );
        })}

        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50 mt-10" pdfMode={pdfMode}>
            {!pdfMode && (
              <button className="link" onClick={handleAdd}>
                <span className="icon icon-add bg-green mr-10"></span>
                Add Line Item
              </button>
            )}
          </View>
          <View className="w-50 mt-20" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.subTotalLabel}
                  onChange={(value) => handleChange("subTotalLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {subTotal?.toFixed(2)}
                </Text>
              </View>
            </View>
            {/* <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.taxLabel}
                  onChange={(value) => handleChange("taxLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {saleTax?.toFixed(2)}
                </Text>
              </View>
            </View> */}
            {/* <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={"Paid Amount"}
                  // onChange={(value) => handleChange('taxLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                <EditableInput
                  className="dark bold right ml-30"
                  value={"-"}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  className="right bold dark p-10"
                  value={invoice.partialAmountPaid}
                  onChange={(value) => handleChange("partialAmountPaid", value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View> */}
            <View className="flex bg-gray p-5" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.totalLabel}
                  onChange={(value) => handleChange("totalLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                <EditableInput
                  className="dark bold right ml-30"
                  value={invoice.currency}
                  onChange={(value) => handleChange("currency", value)}
                  pdfMode={pdfMode}
                />
                <Text className="right bold dark w-auto" pdfMode={pdfMode}>
                  {displayCurrency(
                    (typeof subTotal !== "undefined" &&
                    typeof saleTax !== "undefined"
                      ? invoice.partialAmountPaid
                        ? subTotal +
                          saleTax -
                          parseFloat(invoice.partialAmountPaid)
                        : subTotal + saleTax
                      : 0
                    ).toFixed(2)
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.notesLabel}
            onChange={(value) => handleChange('notesLabel', value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            value={invoice.notes}
            onChange={(value) => handleChange('notes', value)}
            pdfMode={pdfMode}
          />
        </View> */}
        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.termLabel}
            onChange={(value) => handleChange("termLabel", value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            value={invoice.term}
            onChange={(value) => handleChange("term", value)}
            pdfMode={pdfMode}
          />
        </View>
        <View>
          {!pdfMode && (
            <div
              style={{
                display: "flex",
                color: "white",
                marginRight: "10px",
                justifyContent: "space-between",
              }}
            >
              <div>
                {!pdfMode && (
                  <button
                    className="btn"
                    style={{
                      background: "red",
                      color: "white",
                      marginRight: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={() => {
                      hideReturn(false);
                    }}
                  >
                    <span className="material-icons">cancel</span>
                    Cancell
                  </button>
                )}
              </div>
              <div style={{ display: "flex" }}>
                {/* {!pdfMode && invoice.id && (
                  <button
                    className="btn"
                    style={{
                      background: "red",
                      color: "white",
                      marginRight: "10px",
                    }}
                    onClick={deleteInvoice}
                  >
                    Delete Invoice
                  </button>
                )}
                {!pdfMode && invoice.id && (
                  <button
                    className="btn"
                    style={{ background: "green", color: "white" }}
                    onClick={updateInvoice}
                  >
                    Update Invoice
                  </button>
                )} */}
                {/* {!pdfMode && !invoice.id &&<button className='btn' style={{background:'green',color:'white'}} onClick={saveInvoice}>Save Invoice</button>} */}
                {!pdfMode && (
                  <div
                    onClick={(event) => {
                      if (!invoice.id) {
                        saveInvoice(event);
                      }
                    }}
                  >
                    <Download
                      data={invoice}
                      buttonName={!invoice.id ? "Return" : "Return Items"}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePageReturn;
