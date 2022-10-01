import { getDocs } from "firebase/firestore";
import {
  getItemListFromLocalStorage,
  setItemListToLocalStorage,
  sortListDescending,
} from "../utils";
import { addDoc1, auth, docRef, setDoc1 } from "./serverOperation";

const docName = "deposits";

export const getDepositListFromLocalStorage = () => {
  return getItemListFromLocalStorage(docName);
};

export const setDepositListToLocalStorage = (clientList: []) => {
  setItemListToLocalStorage(docName, clientList);
};

export const addDepositToLocalStorage = (data: any, id: any) => {
  const localDepositList = getDepositListFromLocalStorage();
  if (localDepositList) {
    localDepositList.unshift({
      ...data,
      id,
      createdDate: { seconds: Date.now() },
    });
    setDepositListToLocalStorage(localDepositList);
  }
};

export const deleteDepositFromLocalStorage = (id: string) => {
  const localDepositList = getDepositListFromLocalStorage();
  const newDepositList = localDepositList.filter((productLocal: any) => {
    if (productLocal.id === id) {
      return false;
    } else {
      return true;
    }
  });
  setDepositListToLocalStorage(newDepositList);
};

export const updateDepositFromLocalStorage = (id: string, data: any) => {
  const localDepositList = getDepositListFromLocalStorage();
  const newDepositList = localDepositList.map((productLocal: any) => {
    if (productLocal.id === id) {
      return data;
    } else {
      return productLocal;
    }
  });
  setDepositListToLocalStorage(newDepositList);
};

//server call

export const getDeposit = (DoNotrefresh: boolean,setState?:any) => {
  const localDepositList = getDepositListFromLocalStorage();
  if (localDepositList && localDepositList.length > 0 && DoNotrefresh) {
    preProccedDepositList();
    setState?.(localDepositList);
    return new Promise((resolve)=>{resolve(localDepositList);});
  } else {
    return getDocs(docRef(docName))
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
        const preProcessedDepositList = sortListDescending(list);
        setDepositListToLocalStorage(preProcessedDepositList as any);
        preProccedDepositList(preProcessedDepositList);
        setState?.(preProcessedDepositList);
        return preProcessedDepositList;
      })
      .catch((e) => {
        console.log("error", e);
        alert("Unable to get Deposit List");
      });
  }
};

export const addDepositData = (data: any) => {
  return addDoc1(data, docName).then((dataRetured: any) => {
    addDepositToLocalStorage({ ...data }, dataRetured.id);
  });
};

export const updateDepositData = (data: any) => {
  return setDoc1(data, docName, data.id).then((dataRetured) => {
    updateDepositFromLocalStorage(data.id, data);
  });
};

export const deleteDepositList = (data: any) => {
  return setDoc1({ ...data, isDeleted: true }, docName, data.id).then(
    (dataRetured) => {
      deleteDepositFromLocalStorage(data.id);
    }
  );
};



export const preProccedDepositList = (data?:any) => {
  let depositsList = data?data:getDepositListFromLocalStorage();
  let clientKey: any = {};
  depositsList.forEach((depositObj: any) => {
    let clinetObj = {
      totalDeposit: 0,
      totalPurchase: 0,
      name: depositObj.clientName,
      clientId : depositObj.clientId,
    };
    if (clientKey[depositObj.clientId]) {
      if (depositObj.type === "invoice") {
        clientKey[depositObj.clientId].totalPurchase =
          clientKey[depositObj.clientId].totalPurchase + depositObj.amount;
      } else {
        clientKey[depositObj.clientId].totalDeposit =
          clientKey[depositObj.clientId].totalDeposit + depositObj.amount;
      }
    } else {
      clientKey[depositObj.clientId] = clinetObj;
      if (depositObj.type === "invoice") {
        clientKey[depositObj.clientId].totalPurchase =
          clientKey[depositObj.clientId].totalPurchase + depositObj.amount;
      } else {
        clientKey[depositObj.clientId].totalDeposit =
          clientKey[depositObj.clientId].totalDeposit + depositObj.amount;
      }
    }
  });
  setItemListToLocalStorage("depositSummary", clientKey);
};
