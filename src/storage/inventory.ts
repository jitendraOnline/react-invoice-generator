import { getDocs } from "firebase/firestore";
import {
  getItemListFromLocalStorage,
  setItemListToLocalStorage,
} from "../utils";
import { addDoc1, docRef } from "./serverOperation";

const docName = "inventory";

export const getInventoryListFromLocalStorage = (raw?: boolean) => {
  if (raw) {
    return getItemListFromLocalStorage("InventoryList");
  }
  return preProcessInventoryList(getItemListFromLocalStorage("InventoryList"));
};

export const setInventoryListToLocalStorage = (inventoryList: []) => {
  setItemListToLocalStorage("InventoryList", inventoryList);
};

export const addInventoryToLocalStorage = (data: any, id: any) => {
  const localInventoryList = getInventoryListFromLocalStorage(true);
  if (localInventoryList) {
    localInventoryList.unshift({
      ...data,
      id,
      createdDate: { seconds: Date.now() },
    });
    setInventoryListToLocalStorage(localInventoryList as any);
  }
};

export const deleteInventoryFromLocalStorage = (id: string) => {
  const localInventoryList = getInventoryListFromLocalStorage(true);
  const newInventoryList = localInventoryList.filter((productLocal: any) => {
    if (productLocal.id === id) {
      return false;
    } else {
      return true;
    }
  });
  setInventoryListToLocalStorage(newInventoryList as any);
};

export const updateInventoryFromLocalStorage = (id: string, data: any) => {
  const localInventoryList = getInventoryListFromLocalStorage(true);
  const newInventoryList = localInventoryList.map((productLocal: any) => {
    if (productLocal.id === id) {
      return data;
    } else {
      return productLocal;
    }
  });
  //setInventoryListToLocalStorage(newInventoryList as any);
};

export const preProcessInventoryList = (inventoryListProp: any) => {
  let inventoryList = {};
  try {
    inventoryListProp.forEach((item: any) => {
      if ((inventoryList as any)[item.productId]) {
        if (item.type === "added" ) {
          (inventoryList as any)[item.productId].totalUnits =
            (inventoryList as any)[item.productId].totalUnits +
            (item.quantity || 0);
          (inventoryList as any)[item.productId]["Shop" + item.shopNumber] =
            ((inventoryList as any)[item.productId]["Shop" + item.shopNumber]||0) +
            (item.quantity || 0);
        } else if (item.type === "sold" || item.type === "return")  {
          ((inventoryList as any)[item.productId] as any).quantityRemaning =
            ((inventoryList as any)[item.productId] as any).quantityRemaning +
            (item.quantity || 0);
          (inventoryList as any)[item.productId][
            "ShopRemining" + item.shopNumber
          ] =
            ((inventoryList as any)[item.productId][
              "ShopRemining" + item.shopNumber
            ]||0) + (item.quantity || 0);
        }
        (inventoryList as any)[item.productId].history.push({
          ...item,
          createdDate: item.createdDate,
        });
      } else {
        (inventoryList as any)[item.productId] = {
          ...item,
          createdDate: item.createdDate,
          totalUnits: 0,
          quantityRemaning: 0,
          ["Shop" + item.shopNumber]: 0,
          ["ShopRemining" + item.shopNumber]: 0,
        };
        if (item.type === "added") {
          (inventoryList as any)[item.productId].totalUnits = item.quantity ||0;
          (inventoryList as any)[item.productId]["Shop" + item.shopNumber] =
            item.quantity ||0;
        } else if (item.type === "sold" || item.type === "return") {
          ((inventoryList as any)[item.productId] as any).quantityRemaning =
            item.quantity ||0;
          (inventoryList as any)[item.productId][
            "ShopRemining" + item.shopNumber
          ] = item.quantity||0;
        }
        (inventoryList as any)[item.productId].history = [
          { ...item, createdDate: item.createdDate },
        ];
      }
    });
  } catch (e) {
    console.log("Error occured by processing inverntory list");
  }
  console.log("preprocessed inventoryList", inventoryList);
  return Object.values(inventoryList);
};

//getInventoryList
export const getInventoryList = (DoNotrefresh?: boolean, setState?: any) => {
  const localInventoryList = getInventoryListFromLocalStorage();
  if (localInventoryList && localInventoryList.length > 0 && DoNotrefresh) {
    setState?.(localInventoryList);
    return new Promise((resolve) => {
      resolve(localInventoryList);
    });
  } else {
    return getDocs(docRef(docName))
      .then((querySnapshot) => {
        let list: any = [];
        querySnapshot.forEach((doc: any) => {
          let data = doc.data();
          data.id = doc.id;
          data.createdDate = data.createdDate
            ? data.createdDate.toMillis && data.createdDate.toMillis()
            : new Date().getMilliseconds();
          list.push(data);
        });
        setInventoryListToLocalStorage(list as any);
        setState?.(preProcessInventoryList(list) as any);
        return preProcessInventoryList(list);
      })
      .catch((e) => {
        console.log("error", e);
        alert("Unable to get Inventory List");
      });
  }
};

export const addInventoryData = (data: any) => {
  return addDoc1(data, docName).then((dataRetured: any) => {
    addInventoryToLocalStorage({ ...data }, dataRetured.id);
  });
};
