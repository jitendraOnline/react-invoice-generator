import { getDocs } from "firebase/firestore";
import {
  getItemListFromLocalStorage,
  setItemListToLocalStorage,
  sortListDescending,
} from "../utils";
import { addDoc1, docRef, setDoc1 } from "./serverOperation";

const docName = "clients";

export const getClientListFromLocalStorage = () => {
  return getItemListFromLocalStorage("clientList");
};

export const setClientListToLocalStorage = (clientList: []) => {
  setItemListToLocalStorage("clientList", clientList);
};

export const addClientToLocalStorage = (data: any, id: any) => {
  const localClientList = getClientListFromLocalStorage();
  if (localClientList) {
    localClientList.unshift({
      ...data,
      id,
      createdDate: { seconds: Date.now() },
    });
    setClientListToLocalStorage(localClientList);
  }
};

export const deleteClientFromLocalStorage = (id: string) => {
  const localClientList = getClientListFromLocalStorage();
  const newClientList = localClientList.filter((productLocal: any) => {
    if (productLocal.id === id) {
      return false;
    } else {
      return true;
    }
  });
  setClientListToLocalStorage(newClientList);
};

export const updateClientFromLocalStorage = (id: string, data: any) => {
  const localClientList = getClientListFromLocalStorage();
  const newClientList = localClientList.map((productLocal: any) => {
    if (productLocal.id === id) {
      return data;
    } else {
      return productLocal;
    }
  });
  setClientListToLocalStorage(newClientList);
};

//server call

export const getClientList = (DoNotrefresh?: boolean,setState?:any) => {
    const localClientList = getClientListFromLocalStorage();
    if (localClientList && localClientList.length > 0 && DoNotrefresh) {
      return new Promise((resolve)=>{resolve(localClientList)});
    } else {
     return getDocs(docRef(docName))
        .then((querySnapshot) => {
          let list: any = [];
          querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            data.createdDate = data.createdDate? data.createdDate.toMillis && data.createdDate.toMillis() : new Date().getMilliseconds();
            if(!data.isDeleted){
              list.push(data);
            }
          });
         setClientListToLocalStorage(list as any);
         return list;
        })
        .catch((e) => {
          console.log("error", e);
          alert("Unable to get Client List");
        });
    }
};

export const refreshClientList = () =>{
  getClientList(false);
}

export const addClientData = (data: any) => {
  return addDoc1(data, docName).then((dataRetured:any) => {
    addClientToLocalStorage({ ...data }, dataRetured.id);
  });
};

export const updateClientData = (data: any) => {
  return  setDoc1(data, docName, data.id).then((dataRetured) => {
      updateClientFromLocalStorage(data.id, data);
    });
};

export const deleteClientList = (data: any) => {
   return setDoc1({ ...data, isDeleted: true }, docName, data.id).then(
      (dataRetured) => {
        deleteClientFromLocalStorage(data.id);
      }
    );
};
