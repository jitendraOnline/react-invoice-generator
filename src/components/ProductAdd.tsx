import React, { FC, useState, useEffect } from "react";
// import { Invoice, ProductLine } from '../data/types'
// import { initialInvoice, initialProductLine } from '../data/initialData'
import EditableInput from "./EditableInput";
// import EditableSelect from './EditableSelect'
// import EditableTextarea from './EditableTextarea'
// import EditableCalendarInput from './EditableCalendarInput'
// import EditableFileImage from './EditableFileImage'
// import countryList from '../data/countryList'

import Document from "./Document";
import Page from "./Page";
import View from "./View";
import { Font } from "@react-pdf/renderer";
import { ProductType } from "../data/types";
import { getProductListFromLocalStorage } from "../storage/product";

// import IteamList from '../data/ItemDetails'
// import ItemDetails from '../data/ItemDetails'

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
  selectedProduct?: Partial<ProductType>;
  addProduct?: any;
  showProductList?: any;
  updateProduct?: any;
  deleteProductData?: any;
  showDeletedProductList?: any;
  recoverProductData?: any;
}

const ProductAddForm: FC<Props> = ({
  selectedProduct,
  addProduct,
  showProductList,
  updateProduct,
  deleteProductData,
  showDeletedProductList,
  recoverProductData,
}) => {
  const [productData, setProductData] = useState<Partial<ProductType>>({
    cost: 0,
    text: "",
    cost_cash: 0,
    value: "",
    purchasePrice: 0,
  });
  useEffect(() => {
    if (selectedProduct && selectedProduct.id) {
      setProductData(selectedProduct);
    }
  }, [selectedProduct]);

  const handleChange = (
    nameOfField: keyof ProductType,
    value: string | number
  ) => {
    let newProductData = { ...productData };
    newProductData[nameOfField] = value;
    setProductData(newProductData);
  };
  const saveProduct = () => {
    const productList = getProductListFromLocalStorage();
    if (productData.id) {
      if (productData.cost && productData.cost_cash && productData.value) {
        updateProduct({ ...productData, text: productData.value }).then(
          showProductList()
        );
      } else {
        alert("Please add product name, credit cost and cash cost !!! ");
      }
    } else if (productData.cost && productData.cost_cash && productData.value) {
      let isProductAdded = productList.every((product:any)=>{
        return product.text.trim().toLowerCase() !== productData.value?.trim().toLowerCase()
      });
      if (!isProductAdded) {
        alert(
          `Product with name ${productData.value?.trim()} already exisit. you can not create duplicate product.`
        );
      } else {
        addProduct(
          { ...productData, text: productData.value },
          "productList"
        ).then(showProductList());
      }
    } else {
      alert("Please add product name, credit cost and cash cost !!! ");
    }
  };

  const deleteProduct = () => {
    if (productData.id && productData.isDeleted) {
      recoverProductData({ ...selectedProduct }).then(showDeletedProductList());
    } else if (productData.id) {
      deleteProductData({ ...selectedProduct }).then(showProductList());
    } else {
      alert("This Product is not yet added ");
    }
  };

  return (
    <Document>
      <Page className="invoice-wrapper">
        <span
          className="material-icons"
          style={{ cursor: "pointer" }}
          onClick={
            (selectedProduct &&
              selectedProduct.id &&
              !selectedProduct.isDeleted) ||
            !selectedProduct
              ? showProductList
              : showDeletedProductList
          }
        >
          arrow_back
        </span>
        <View className="flex">
          <View>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <EditableInput value="Product Name" />
              <EditableInput
                placeholder="Product Name"
                value={productData.value}
                onChange={(value) => handleChange("value", value)}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "row" }}>
              <EditableInput value="Cost Price" />
              <EditableInput
                placeholder="Purchase"
                type="number"
                value={productData.purchasePrice}
                onChange={(value) => handleChange("purchasePrice", value)}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "row" }}>
              <EditableInput value="Selling Price Credit" />
              <EditableInput
                placeholder="Credit"
                value={productData.cost}
                type="number"
                onChange={(value) => handleChange("cost", value)}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "row" }}>
              <EditableInput value="Selling Price Cash" />
              <EditableInput
                placeholder="Cash"
                type="number"
                value={productData.cost_cash}
                onChange={(value) => handleChange("cost_cash", value)}
              />
            </div>
          </View>
        </View>
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            justifyContent: "space-between",
          }}
        >
          {((selectedProduct && !selectedProduct.isDeleted) ||
            !selectedProduct) && (
            <button
              className="btn"
              style={{ background: "green", color: "white" }}
              onClick={saveProduct}
            >
              {selectedProduct && selectedProduct.id ? "Update" : "Add"} Product
            </button>
          )}
          {selectedProduct && selectedProduct.id && (
            <button
              className="btn"
              style={{
                background: !selectedProduct.isDeleted ? "red" : "blue",
                color: "white",
                marginRight: "10px",
              }}
              onClick={deleteProduct}
            >
              {!selectedProduct.isDeleted ? "Delete" : "Recover"} Product
            </button>
          )}
        </div>
      </Page>
    </Document>
  );
};

export default ProductAddForm;
