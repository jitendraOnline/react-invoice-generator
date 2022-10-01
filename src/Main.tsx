import React, { FC, useState, useEffect } from "react";
import InvoicePage from "./components/InvoicePage";
import { getDocs } from "firebase/firestore";
import InvoiceList from "./components/invoiceList";
import { initialInvoice } from "./data/initialData";
import ProductAddForm from "./components/ProductAdd";
import { ProductType } from "./data/types";
import Dashboard from "./components/Dashboard";
import InventoryList from "./components/InventoryList";
import {
  getInvoiceListFromLocalStorage,
  setInvoiceListToLocalStorage,
  sumProductLines,
} from "./storage/invoice";
import { sortListDescending } from "./utils";
import {
  getProductListFromLocalStorage,
  setProductListToLocalStorage,
} from "./storage/product";
import {
  addInventoryData,
  getInventoryListFromLocalStorage,
  preProcessInventoryList,
  setInventoryListToLocalStorage,
} from "./storage/inventory";
import ClientList from "./components/ClientList";
import {
  getClientListFromLocalStorage,
  setClientListToLocalStorage,
} from "./storage/clients";
import {
  addDoc1,
  auth,
  docRef,
  getDataById,
  setDoc1,
} from "./storage/serverOperation";
import { addDepositData, getDeposit } from "./storage/deposits";

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
  {
    field: "cost",
    filter: "agNumberColumnFilter",
    sortable: true,
    headerName: "Seeling Price ",
  },
  {
    field: "cost_cash",
    filter: "agNumberColumnFilter",
    sortable: true,
    headerName: "Seeling Price Cash ",
  },
];

interface Props {
  logout?: any;
}

const Main: FC<Props> = ({ logout }) => {
  const [productList, setProductList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [clientId, setClientId] = useState('');
  const [intialData, setintialData] = useState();
  const [showInvoice, setShowInvoice] = useState("clients");
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
    } else {
      console.log("GETTING FROM SERVER ->", "INVOICE");
      getDocs(docRef("invoiceList"))
        .then((querySnapshot) => {
          let list: any = [];
          querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            data = sumProductLines(data);
            if (!data.isDeleted) {
              if (
                auth.currentUser?.email &&
                auth.currentUser?.email?.indexOf("admin") > -1
              ) {
                list.push(data);
              } else {
                if (data.createdBy === auth.currentUser?.email) {
                  list.push(data);
                }
              }
            }
          });
          const sortedList = sortListDescending(list);
          setInvoiceList(sortedList);
          setInvoiceListToLocalStorage(sortedList);
        })
        .catch((e) => {
          console.log("Error by fetching invoiveList", e);
          alert(
            "Unable to fetch Invoice list. Please check your internet connection or login again "
          );
        });
    }
  };

  const getInvoice = (id: any) => {
    if (id === "createNew") {
      setintialData(initialInvoice as any);
      setShowInvoice("createInvoice");
    } else {
      console.log("GETTING FROM SERVER -INVOICE",id);
      getDataById("invoiceList", id)
        .then((docSnap) => {
          if (docSnap.exists()) {
            let invoiceData = docSnap.data();
            setintialData({ ...invoiceData, id } as any);
            setShowInvoice("createInvoice");
          }
        })
        .catch((e) => {
          console.log("Error", e);
          alert(
            "Unable to fetch data. Check your internet connection or login again"
          );
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

  const reduceInventoryAfterInvoice = (data: any) => {
      const promiseList: any = [];
      data.productLines
        .filter((obj: any) => {
          return obj.productId;
        })
        .forEach((product: any) => {
          let negativeInventory = {
            type: "sold",
            quantity: -product.quantity,
            productId: product.productId,
            expiryDate: null,
            productName: product.itemNameNew,
            shopNumber:
              auth.currentUser?.email?.indexOf("admin") === -1 ? "2" : "1",
            invoiceId: data.id,
            //invoice:data,
          };
          promiseList.push(addInventoryData(negativeInventory));
        });
      return Promise.all(promiseList)
        .then((values) => {
          console.log("All the line items are sold");
        })
        .then(() => {
          return { status: "Done" };
        });
    };

  const createNewInvoice = (data: any, collectionName: string) => {
      return addDoc1(data, "invoiceList").then((dataReturned: any) => {
        const deposit = {
          type: "invoice",
          clientName: data.clientName,
          clientId: data.clientId,
          amount: -sumProductLines(data).totalAmount || 0,
          dateOfDeposit: new Date(),
          depositer: "Invoice",
          notes: "purchased items",
          invoiceId: dataReturned.id,
        };
       return addDepositData(deposit).then(() => {
          return reduceInventoryAfterInvoice({
            ...data,
            id: dataReturned.id,
          });
        });
      });
  };

  const updateInvoiceData = (data: any) => {
    return setDoc1(data, "invoiceList", data.id);
  };

  const getProductList = (DoNotrefresh?: boolean) => {
    const localProductList = getProductListFromLocalStorage();
    if (localProductList && localProductList.length > 0 && DoNotrefresh) {
      setProductList(localProductList);
      return;
    } else {
      console.log("GETTING DATA FROM SERVER:PRODUCT LIST");
      getDocs(docRef("productList"))
        .then((querySnapshot) => {
          let list: any = [];
          let deletedList: any = [];
          querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            data.text = data.text.trim();
            data.value = data.value.trim();
            if (!data.isDeleted) {
              list.push(data);
            } else {
              deletedList.push(data);
            }
          });
          const sortedProductList = list.sort(
            (a: { text: any }, b: { text: any }) =>
              a.text?.trim() > b.text?.trim() ? 1 : -1
          );
          const deletedProductList = deletedList.sort(
            (a: { text: any }, b: { text: any }) =>
              a.text?.trim() > b.text?.trim() ? 1 : -1
          );
          setProductList(sortedProductList);
          setDeletedProductList(deletedProductList);
          setProductListToLocalStorage(sortedProductList);
        })
        .catch((e) => {
          alert(
            "Unable to get Product list. Please check your internet connection or login again"
          );
        });
    }
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
    getProductList(true);
  };

  const showDeletedProductList = () => {
    setSelectedProduct({});
    setColumnDefs(productLisColumnt);
    setShowInvoice("deletedproduct");
    getProductList(true);
  };

  const refresh = () => {
    getProductList(false);
    getInvoiceList(false);
  };

  //getInventoryList
  const getInventoryList = (DoNotrefresh?: boolean) => {
    const localInventoryList = getInventoryListFromLocalStorage();
    if (localInventoryList && localInventoryList.length > 0 && DoNotrefresh) {
      setInventoryList(localInventoryList as any);
      return;
    } else {
      console.log("GETTING FROM SERVER ->",'INVENTORY');
      getDocs(docRef("inventory"))
        .then((querySnapshot) => {
          let list: any = [];
          querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            data.createdDate = data.createdDate
              ? data.createdDate.toMillis && data.createdDate.toMillis()
              : new Date().getMilliseconds();
            list.push(data);
          });
          const preProcessedInventoryList = preProcessInventoryList(list);
          setInventoryList(list);
          setInventoryListToLocalStorage(preProcessedInventoryList as any);
        })
        .catch((e) => {
          console.log("error", e);
          alert("Unable to get Inventory List");
        });
    }
  };

  const getClientList = (DoNotrefresh?: boolean) => {
    const localClientList = getClientListFromLocalStorage();
    if (localClientList && localClientList.length > 0 && DoNotrefresh) {
      setClientList(localClientList);
      return;
    } else {
      console.log("GETTING FROM SERVER ->", "CLIENTLIST");
      getDocs(docRef("clients"))
        .then((querySnapshot) => {
          let list: any = [];
          querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            list.push(data);
          });
          const preProcessedClientList = sortListDescending(list, "name");
          setClientList(preProcessedClientList as any);
          setClientListToLocalStorage(preProcessedClientList as any);
        })
        .catch((e) => {
          console.log("error", e);
          alert("Unable to get Client List");
        });
    }
  };

  const refreshProductList = () => {
    getProductList(false);
  };
  const refreshInventoryList = () => {
    getInventoryList(false);
  };
  const refreshInvoiceList = () => {
    getInvoiceList(false);
  };
  const refreshClientList = () => {
    getDeposit(false);
    getClientList(false);
    getInventoryList(false);
  };

  const navigateToScreen = (screenName: string,type?:string,dataforScreen?: any,) => {
    if (dataforScreen) {
      if (screenName === "createInvoice") {
        setClientId("");
        if (type ==='data') {
          setintialData({
            ...initialInvoice,
            clientName: dataforScreen.name,
            clientAddress2: dataforScreen.phoneNumber,
            clientAddress: dataforScreen.city,
            clientId: dataforScreen.id,
          } as any);
          setShowInvoice(screenName);
        } else if (type === "id") {
          getInvoice(dataforScreen);
        }
      }
      if (screenName === "clients") {
        if (type === "data") {
          setClientId(dataforScreen);
          setShowInvoice(screenName);
        } else if (type === "id") {
          getInvoice(dataforScreen);
        }
      }
    } else {
      setClientId('');
      setintialData({ ...initialInvoice } as any);
      setSelectedProduct({ text: "", value: "", cost: "0", cost_cash: "0" });
      setShowInvoice(screenName);
    }
    
  };

  useEffect(() => {
    getProductList(true);
    getInvoiceList(true);
   // getInventoryList(true);
   // getClientList(true);
    getDeposit(true);
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
            onClick={() => {
              navigateToScreen("inventory");
            }}
          >
            <span className="material-icons">inventory_2</span>
            <span className="menuItemTitle">Inventory</span>
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
              navigateToScreen("clients");
            }}
          >
            <span className="material-icons">group</span>
            <span className="menuItemTitle">Users</span>
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
            onClick={showInvoiceList}
          >
            <span className="material-icons">receipt_long</span>
            <span className="menuItemTitle">Invoices</span>
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
            <span className="menuItemTitle">Products</span>
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
              navigateToScreen("dashboard");
            }}
          >
            <span className="material-icons">dashboard</span>
            <span className="menuItemTitle">Dashboard</span>
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
            <span className="menuItemTitle">Logout</span>
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

            onClick={()=>{(window.location as any).reload(true)}}
            //@TODO Configure shop detatils//counter and number of user per counter.
            //payment methods like bank details to maintain the records in bank.
            //add product category to let them select from whilte creating product.
          >
            <span className="material-icons">browser_updated</span>
            <span className="menuItemTitle">Update</span>
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
          {showInvoice === "createInvoice" && (
            <InvoicePage
              navigateToScreen={navigateToScreen}
              data={intialData ? intialData : false}
              //experiemnt for inverntory
              // addInvoiceData={addDoc1}
              addInvoiceData={createNewInvoice}
              productList={productList}
              showInvoiceList={showInvoiceList}
              productListForDropDown={productList}
              updateInvoiceData={updateInvoiceData}
            />
          )}
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
              refresh={refreshInvoiceList}
              auth={auth}
              data={invoiceList}
              createOrUpdateAction={getInvoice}
              columnDefs={columnDefs}
              typeOfList={showInvoice}
            ></InvoiceList>
          )}
          {showInvoice === "product" && (
            <InvoiceList
              refresh={refreshProductList}
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
          {showInvoice === "inventory" && (
            <InventoryList
              productList1={productList}
              addDoc1={addDoc1}
              refresh={refreshInventoryList}
            ></InventoryList>
          )}
          {showInvoice === "clients" && (
            <ClientList
              clientId={clientId}
              refresh={refreshClientList}
              navigateToScreen={navigateToScreen}
            ></ClientList>
          )}
        </div>
        <div style={{ height: "50px" }}></div>
      </div>
    </div>
  );
};

export default Main;
