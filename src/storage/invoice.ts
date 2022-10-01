import {
  capitalizeWords,
  getItemListFromLocalStorage,
  setItemListToLocalStorage,
} from "../utils";

export const sumProductLines = (data: any) => {
  data.totalAmount = 0;
  data.productLines.forEach((pdItem: any) => {
    const quantityNumber = parseFloat(pdItem.quantity);
    const rateNumber = parseFloat(pdItem.rate);
    const amount =
      quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;
    data.totalAmount = data.totalAmount + amount;
  });
  return data;
};

export const getDistinctUserStorage = (data: any) => {
  let distinctValuesOfField: any = {};
  data.forEach((data: any) => {
    let key = (data["clientName"] + "").toLowerCase();
    if (distinctValuesOfField[key] ) {
        if (!distinctValuesOfField[key].phoneNumber) {
            distinctValuesOfField[key].phoneNumber = data.clientAddress2;
        }
        else if(!distinctValuesOfField[key].city){
            distinctValuesOfField[key].city = capitalizeWords(
              data.clientAddress
            );
        }
    } else {
      distinctValuesOfField[key] = {
        name: capitalizeWords(data.clientName),
        city: capitalizeWords(data.clientAddress),
        phoneNumber: data.clientAddress2,
      };
    }
  });
  localStorage.setItem(
    'userList',
    JSON.stringify(
      Object.values(distinctValuesOfField)
    )
  );
};

export const getDistinctTypesToLocalStorage = (data: any, field: any) => {
  let distinctValuesOfField: any = {};
  data.forEach((data: any) => {
    let key = (data[field] + "").toLowerCase();
    if (distinctValuesOfField[key]) {
      distinctValuesOfField[key] = distinctValuesOfField[key] + 1;
    } else {
      distinctValuesOfField[key] = 1;
    }
  });
  localStorage.setItem(
    field,
    JSON.stringify(
      Object.keys(distinctValuesOfField).map((value) => {
        return capitalizeWords(value);
      })
    )
  );
};

export const getInvoiceListFromLocalStorage = () => {
  return getItemListFromLocalStorage("invoiceList");
};

export const setInvoiceListToLocalStorage = (InvoiceList: []) => {
  getDistinctTypesToLocalStorage(InvoiceList, "clientName");
  getDistinctTypesToLocalStorage(InvoiceList, "clientAddress");
  getDistinctUserStorage(InvoiceList);
  setItemListToLocalStorage("invoiceList", InvoiceList);
};

export const addInvoiceToLocalStorage = (data: any, id: any) => {
  const localInvoiceList = getInvoiceListFromLocalStorage();
  if (localInvoiceList) {
    const newInvoice = sumProductLines({
      ...data,
      id: id,
      createdDate: { seconds: Date.now() },
    });
    localInvoiceList.unshift(newInvoice);
    setInvoiceListToLocalStorage(localInvoiceList);
  }
};

export const deleteInvoiceFromLocalStorage = (id: string) => {
 const localInvoiceList = getInvoiceListFromLocalStorage();
  const newInvoiceList = localInvoiceList.filter((invoiceLocal: any) => {
    if (invoiceLocal.id === id) {
      return false;
    } else {
      return true;
    }
  });
  setInvoiceListToLocalStorage(newInvoiceList);
};

export const updateInvoiceFromLocalStorage = (id: string,data:any) => {
  const localInvoiceList = getInvoiceListFromLocalStorage();
   const newInvoiceList = localInvoiceList.map((invoiceLocal: any) => {
     if (invoiceLocal.id === id) {
       return sumProductLines(data);
     } else {
       return invoiceLocal;
     }
   });
  setInvoiceListToLocalStorage(newInvoiceList);
};
