import React, { FC, useEffect, useState } from "react";
import { Font } from "@react-pdf/renderer";
import View from "./View";
import EditableInput from "./EditableInput";
import EditableTextarea from "./EditableTextarea";
import EditableCalendarInput from "./EditableCalendarInput";
import { format } from "date-fns";
import { displayDate } from "../utils";
import DatePicker from 'react-datepicker'
import { addInventoryData } from "../storage/inventory";

interface InvertoryItem {
  productName?: string;
  productId?: string;
  quantity?: string;
  quantityRemaning?: string;
  stockAddedDate?: Date;
  expiryDate: Date  ;
  addedBy?: string;
  shopNumber?: string;
  notes?: string;
}

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
  productList1: any;
  addDoc1: any;
}

const initialProcduct = {
  productName: "",
  productId: "",
  quantity: "0",
  expiryDate: new Date(),
  shopNumber: "",
  notes: "",
};

const InventoryAdd: FC<Props> = ({ productList1 }) => {
  const [productSearch, setProductSearch] = useState("");
  const [expirydate, setexpirydate] = useState(new Date());
  const [productData, setProductData] =
    useState<InvertoryItem>(initialProcduct);
  
  const handleChange = (nameOfField: keyof InvertoryItem, value: string|Date) => {
    let newProductData = JSON.parse(JSON.stringify(productData));
    if(false && nameOfField === 'expiryDate'){
      (newProductData as any)[nameOfField] = new Date(value);
      //expirydate = new Date(value);
    }
    else{
      (newProductData as any)[nameOfField] = value;
    }
    setProductData({...newProductData});
  };

  const addToinventory = () => {
      if (
        productData &&
        productData.productId &&
        productData.quantity &&
        productData.shopNumber
      ) {
        addInventoryData(
          {
            ...productData,
            quantity: parseInt(productData.quantity),
            type: "added",
          }
        )
          .then(() => {
            alert("Inventory Added successfully");
            setProductData(initialProcduct);
          })
          .catch(() => {
            alert("Unable to add inventory. Please try after sometime");
          });
      }
  };

  return (
    <div>
      <View>
        <input
          type="text"
          placeholder="type name of product"
          style={{ padding: "5px", width: "100%" }}
          onChange={(event) => {
            setProductSearch(event.target.value);
          }}
        ></input>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "75vh",
            overflow: "scroll",
          }}
        >
          {productList1
            .filter((obj: any) => {
              if (!productSearch) {
                return true;
              } else {
                return (
                  obj.text.toLowerCase().indexOf(productSearch.toLowerCase()) >
                  -1
                );
              }
            })
            .map((obj: any) => {
              return (
                <div
                  style={{
                    display: "flex",
                    padding: "5px",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    flexDirection: "column",
                  }}
                  onClick={() => {
                    setProductData({
                      ...productData,
                      productName: obj?.text,
                      productId: obj?.id,
                    });
                  }}
                >
                  <div>{obj.text}</div>
                  {productData.productId === obj.id && (
                    <div style={{ padding: "5px" }}>
                      <View>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <EditableInput value="Shop number" />
                          <EditableInput
                            placeholder="Shop number"
                            type="number"
                            value={productData.shopNumber}
                            onChange={(value) =>
                              handleChange("shopNumber", value)
                            }
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <EditableInput value="Quantity" />
                          <EditableInput
                            placeholder="Purchase"
                            type="number"
                            value={productData.quantity}
                            onChange={(value) =>
                              handleChange("quantity", value)
                            }
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div style={{ flex: "1" }}>
                            <EditableInput value="Expiry Date" />
                          </div>

                          <div style={{ flex: "1" }}>
                            <DatePicker
                              className="input"
                              selected={expirydate}
                              onChange={(value: Date) => {
                                setexpirydate(value);
                                handleChange("expiryDate", value);
                              }}
                              dateFormat="MMM dd, yyyy"
                            />
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <EditableInput value="Notes" />
                          <EditableTextarea
                            placeholder="Notes"
                            value={productData.notes}
                            onChange={(value) => handleChange("notes", value)}
                          />
                        </div>

                        <div>
                          <button
                            onClick={() => {
                              addToinventory();
                            }}
                          >
                            Add to Inventory
                          </button>
                        </div>
                      </View>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </View>
    </div>
  );
};

export default InventoryAdd;
