import React, { FC, useState, useEffect } from "react";
import InvoicePage from "./components/InvoicePage";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import InvoiceList from "./components/invoiceList";
import { initialInvoice } from "./data/initialData";
import ProductAddForm from "./components/ProductAdd";
import { ProductType } from "./data/types";
import Dashboard from "./components/Dashboard";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const addDoc1 = (data: any, collectionName: string) => {
  return addDoc(collection(db, collectionName), {
    ...data,
    createdDate: new Date(),
  }).then((dataRetured) => {
    try {
      const localInvoiceList = getInvoiceListFromLocalStorage();
      if (localInvoiceList) {
        const newInvoice = sumProductLines({ ...data, id: dataRetured.id });
        localInvoiceList.unshift(newInvoice);
        setInvoiceListToLocalStorage(localInvoiceList);
      }
    } catch (e) {
      alert("Refresh the list to get latet data..");
    }
    console.log("added data", dataRetured.id);
  });
};

const docRef = (collectionName: string) => {
  return collection(db, collectionName);
};

const setDoc1 = (data: any, collectionName: string, id: any) => {
  const docRef = doc(db, collectionName, id);
  return setDoc(docRef, data).then((dataReturned) => {
    try {
      const localInvoiceList = getInvoiceListFromLocalStorage();
      if (data.isDeleted && localInvoiceList && localInvoiceList.length > 0) {
        const newInvoiceList = localInvoiceList.filter((invoiceLocal: any) => {
          if (invoiceLocal.id === data.id) {
            return false;
          } else {
            return true;
          }
        });
        setInvoiceListToLocalStorage(newInvoiceList);
      } else {
        const newInvoiceList = localInvoiceList.map((invoiceLocal: any) => {
          if (invoiceLocal.id === data.id) {
            return sumProductLines(data);
          } else {
            return invoiceLocal;
          }
        });
        setInvoiceListToLocalStorage(newInvoiceList);
      }
    } catch (e) {
      alert("Refresh the list to get latet data..");
    }
    console.log("updated data with id", dataReturned);
  });
};

const deleteDoc1 = (collectionName: string, id: any) => {
  const docRef = doc(db, collectionName, id);
  return deleteDoc(docRef).then((data) => {
    console.log("deleted data", data);
  });
};

const getDataById = (collectionName: string, id: any) => {
  const docRef = doc(db, collectionName, id);
  return getDoc(docRef);
};

const invoiceListColumn = [
  {
    headerName: "No.",
    valueGetter: "node.rowIndex + 1",
    width: "60px",
  },
  {
    field: "clientName",
    filter: "agTextColumnFilter",
    sortable: true,
    comparator: (
      valueA: any,
      valueB: any,
      nodeA: any,
      nodeB: any,
      isInverted: any
    ) => {
      if (valueA == valueB) return 0;
      return valueA > valueB ? 1 : -1;
    },
    suppressMenuHide: true,
  },
  {
    field: "clientAddress2",
    headerName: "Phone Number",
    width: "130px",
  },
  {
    field: "invoiceDate",
    width: "130px",
    filter: "agDateColumnFilter",
    sortable: true,
    sortingOrder: ["desc", "asc"],
    comparator: (
      valueA: any,
      valueB: any,
      nodeA: any,
      nodeB: any,
      isInverted: any
    ) => {
      if (!valueA) {
        return -1;
      } else if (!valueB) {
        return 1;
      }
      const cellDateA = new Date(valueA);
      const cellDateB = new Date(valueB);
      if (cellDateA == cellDateB) return 0;

      return cellDateA > cellDateB ? 1 : -1;
    },
    filterParams: {
      comparator: (filterLocalDateAtMidnight: any, cellValue: any) => {
        const dateAsString = cellValue;
        if (dateAsString == null) {
          return 0;
        }
        const cellDate = new Date(cellValue);
        if (cellDate < filterLocalDateAtMidnight) {
          return -1;
        } else if (cellDate > filterLocalDateAtMidnight) {
          return 1;
        }
        return 0;
      },
    },
  },
  {
    field: "totalAmount",
    sortable: true,
    filter: "agNumberColumnFilter",
    width: "130px",
  },
  { field: "paymentType", filter: "agTextColumnFilter", width: "130px" },
  { field: "clientAddress", filter: "agTextColumnFilter" },

  { field: "paymentStatus", width: "100px", filter: "agTextColumnFilter" },
];

const productLisColumnt = [
  {
    field: "text",
    filter: "agTextColumnFilter",
    sortable: true,
    comparator: (
      valueA: any,
      valueB: any,
      nodeA: any,
      nodeB: any,
      isInverted: any
    ) => {
      if (valueA == valueB) return 0;
      return valueA > valueB ? 1 : -1;
    },
    sortingOrder: ["desc", "asc"],
  },
  { field: "cost", filter: "agNumberColumnFilter", sortable: true },
  { field: "cost_cash", filter: "agNumberColumnFilter", sortable: true },
];

const sumProductLines = (data: any) => {
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

///LogalStorageSaveData

const capitalizeFirstLetter = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};
//capitalize all words of a string.
const capitalizeWords = (value: string) => {
  return value.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
};

const getDistinctTypesToLocalStorage = (data: any, field: any) => {
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

const setInvoiceListToLocalStorage = (InvoiceList: []) => {
  getDistinctTypesToLocalStorage(InvoiceList, "clientName");
  getDistinctTypesToLocalStorage(InvoiceList, "clientAddress");
  localStorage.setItem("InvoiceList", JSON.stringify(InvoiceList));
};

const getInvoiceListFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("InvoiceList") || "[]");
};

interface Props {
  logout?: any;
}

const Main: FC<Props> = ({ logout }) => {
  const [productList, setProductList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [intialData, setintialData] = useState();
  const [showInvoice, setShowInvoice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Partial<ProductType>>({
    id: "",
  });
  const [deletedProductList, setDeletedProductList] = useState([]);

  const [columnDefs, setColumnDefs] = useState(invoiceListColumn as any);

  const getInvoiceList = (DoNotrefresh?: boolean) => {
    const localInvoiceList = getInvoiceListFromLocalStorage();
    if (localInvoiceList && localInvoiceList.length > 0 && DoNotrefresh) {
      setInvoiceList(localInvoiceList);
      return;
    }
    getDocs(docRef("invoiceList")).then((querySnapshot) => {
      let list: any = [];
      querySnapshot.forEach((doc) => {
        let data = doc.data();
        data.totalAmount = 0;
        data.productLines.forEach((pdItem: any) => {
          const quantityNumber = parseFloat(pdItem.quantity);
          const rateNumber = parseFloat(pdItem.rate);
          const amount =
            quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;
          data.totalAmount = data.totalAmount + amount;
        });
        data.id = doc.id;
        if (!data.isDeleted) {
          list.push(data);
        }
      });
      try {
        const sortedList = list.sort((obj1: any, obj2: any) => {
          let valueA = obj1 && obj1.invoiceDate;
          let valueB = obj2 && obj2.invoiceDate;
          if (!valueA) {
            return 1;
          } else if (!valueB) {
            return -1;
          }
          const cellDateA = new Date(valueA);
          const cellDateB = new Date(valueB);
          if (cellDateA == cellDateB) return 0;
          return cellDateA > cellDateB ? -1 : 1;
        });
        setInvoiceList(sortedList);
        setInvoiceListToLocalStorage(sortedList);
      } catch (e) {
        setInvoiceList(list);
        setInvoiceListToLocalStorage(list);
      }
      //setInvoiceList(list);
    });
  };

  const getInvoice = (id: any) => {
    if (id === "createNew") {
      setintialData(initialInvoice as any);
      setShowInvoice("");
    } else {
      getDataById("invoiceList", id).then((docSnap) => {
        if (docSnap.exists()) {
          let invoiceData = docSnap.data();
          setintialData({ ...invoiceData, id } as any);
          setShowInvoice("");
        }
      });
    }
  };

  const showInvoiceList = (id: any) => {
    setShowInvoice("invoice");
    setColumnDefs(invoiceListColumn);
    setTimeout(() => {
      getInvoiceList(true);
    }, 100);
  };

  const updateInvoiceData = (data: any) => {
    return setDoc1(data, "invoiceList", data.id);
  };

  //get product list and perform operation
  const getList = () => {
    setProductList([]);
    setTimeout(() => {
      getDocs(docRef("productList")).then((querySnapshot) => {
        let list: any = [];
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          let data = doc.data();
          data.id = doc.id;
          if (!data.isDeleted) {
            list.push(data);
          }
        });
        setProductList(
          list.sort((a: { text: any }, b: { text: any }) =>
            a.text > b.text ? 1 : -1
          )
        );
      });
    }, 1000);
  };

  const getProductList = (DoNotrefresh?: boolean) => {
    setTimeout(() => {
      getDocs(docRef("productList")).then((querySnapshot) => {
        let list: any = [];
        let deletedList: any = [];
        querySnapshot.forEach((doc) => {
          let data = doc.data();
          data.id = doc.id;
          if (!data.isDeleted) {
            list.push(data);
          } else {
            deletedList.push(data);
          }
        });
        const sortedProductList = list.sort(
          (a: { text: any }, b: { text: any }) => (a.text > b.text ? 1 : -1)
        );
        const deletedProductList = deletedList.sort(
          (a: { text: any }, b: { text: any }) => (a.text > b.text ? 1 : -1)
        );
        setProductList(sortedProductList);
        setDeletedProductList(deletedProductList);
      });
    }, 1000);
  };

  const getProductData = (id: any, data: ProductType) => {
    setSelectedProduct(data);
    setShowInvoice("showProductForm");
  };

  const updateProductData = (data: any) => {
    return setDoc1(data, "productList", data.id);
  };

  const deleteProductData = (data: any) => {
    return setDoc1({ ...data, isDeleted: true }, "productList", data.id);
  };

  const undeleteProductData = (data: any) => {
    return setDoc1({ ...data, isDeleted: false }, "productList", data.id);
  };

  const showProductList = () => {
    setSelectedProduct({});
    setColumnDefs(productLisColumnt);
    setShowInvoice("product");
    getProductList();
  };

  const showDeletedProductList = () => {
    setSelectedProduct({});
    setColumnDefs(productLisColumnt);
    setShowInvoice("deletedproduct");
    getProductList(true);
  };

  const refresh = () => {
    getList();
    getInvoiceList();
  };

  useEffect(() => {
    getList();
    getInvoiceList();
  }, []);

  return (
    <div className="mainApp" style={{ width: "80wh", height: "100vh" }}>
      <div style={{ display: "flex", background: "green", color: "white" }}>
        <div className="menuItemContainer">
          <div
            style={{
              padding: "10px",
              margin: "10px",
              cursor: "pointer",
              borderBottom: "2px solid #ccc",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onClick={showInvoiceList}
          >
            <span className="material-icons">receipt_long</span>
            Invoices
          </div>
          <div
            style={{
              padding: "10px",
              margin: "10px",
              cursor: "pointer",
              borderBottom: "2px solid #ccc",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onClick={() => showProductList()}
          >
            <span className="material-icons">category</span>
            Products
          </div>
          <div
            style={{
              padding: "10px",
              margin: "10px",
              cursor: "pointer",
              borderBottom: "2px solid #ccc",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onClick={() => {
              setShowInvoice("dashboard");
            }}
          >
            <span className="material-icons">dashboard</span>
            Dashboard
          </div>
          <div
            style={{
              padding: "10px",
              margin: "10px",
              cursor: "pointer",
              borderBottom: "2px solid #ccc",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onClick={logout}
          >
            <span className="material-icons">logout</span>
            Logout
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "top",
          flex: "1",
          overflow: "auto",
          flexDirection: "column",
        }}
      >
        <div className="app">
          {/* <h1 className="center fs-30" style={{color:'green'}}>OM SAI KRISHI SEVA KENDRA 
          
          </h1> */}
          {!showInvoice ? (
            <InvoicePage
              data={intialData ? intialData : false}
              addInvoiceData={addDoc1}
              productList={productList}
              showInvoiceList={showInvoiceList}
              productListForDropDown={productList}
              updateInvoiceData={updateInvoiceData}
            />
          ) : null}
          {showInvoice === "showProductForm" && (
            <ProductAddForm
              selectedProduct={selectedProduct}
              addProduct={addDoc1}
              showProductList={showProductList}
              updateProduct={updateProductData}
              deleteProductData={deleteProductData}
              showDeletedProductList={showDeletedProductList}
              recoverProductData={undeleteProductData}
            ></ProductAddForm>
          )}

          {showInvoice === "invoice" && (
            <InvoiceList
              refresh={refresh}
              data={invoiceList}
              createOrUpdateAction={getInvoice}
              columnDefs={columnDefs}
              typeOfList={showInvoice}
            ></InvoiceList>
          )}
          {showInvoice === "product" && (
            <InvoiceList
              data={productList}
              columnDefs={columnDefs}
              createOrUpdateAction={getProductData}
              typeOfList={showInvoice}
            ></InvoiceList>
          )}
          {showInvoice === "deletedproduct" && (
            <InvoiceList
              data={deletedProductList}
              columnDefs={columnDefs}
              createOrUpdateAction={getProductData}
              typeOfList={showInvoice}
              disableActions={true}
            ></InvoiceList>
          )}
          {showInvoice === "dashboard" && (
            <Dashboard setTableDataToBeShown={setInvoiceList}>
              <InvoiceList
                data={invoiceList}
                createOrUpdateAction={getInvoice}
                columnDefs={invoiceListColumn}
                typeOfList={showInvoice}
                disableActions={true}
              ></InvoiceList>
            </Dashboard>
          )}
        </div>
        <div style={{ height: "50px" }}></div>
      </div>
    </div>
  );
};

export default Main;
