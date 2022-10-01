import {
  getItemListFromLocalStorage,
  setItemListToLocalStorage,
} from "../utils";

export const getProductListFromLocalStorage = () => {
  return getItemListFromLocalStorage("productList");
};

export const setProductListToLocalStorage = (InvoiceList: []) => {
  setItemListToLocalStorage("productList", InvoiceList);
};

export const addProductToLocalStorage = (data: any, id: any) => {
  const localProductList = getProductListFromLocalStorage();
  if (localProductList) {
    localProductList.unshift({
      ...data,
      id,
      createdDate: { seconds: Date.now() },
    });
    setProductListToLocalStorage(localProductList);
  }
};

export const deleteProductFromLocalStorage = (id: string) => {
  const localProductList = getProductListFromLocalStorage();
  const newProductList = localProductList.filter((productLocal: any) => {
    if (productLocal.id === id) {
      return false;
    } else {
      return true;
    }
  });
  setProductListToLocalStorage(newProductList);
};

export const updateInvoiceFromLocalStorage = (id: string, data: any) => {
  const localProductList = getProductListFromLocalStorage();
  const newProductList = localProductList.map((productLocal: any) => {
    if (productLocal.id === id) {
      return data;
    } else {
      return productLocal;
    }
  });
  setProductListToLocalStorage(newProductList);
};
