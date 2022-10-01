import { getDocs } from "firebase/firestore";
import { getItemListFromLocalStorage, setItemListToLocalStorage } from "../utils";
import { docRef } from "./serverOperation";

const docName = "config";

export const getConfigListFromLocalStorage = () => {
  return getItemListFromLocalStorage(docName);
};

export const setConfigListToLocalStorage = (configObj: []) => {
  setItemListToLocalStorage(docName, configObj);
};

export const getConfig = (DoNotrefresh: boolean) => {
  const localConfigList = getConfigListFromLocalStorage();
  if (localConfigList && Object.keys(localConfigList).length>0 && DoNotrefresh) {
    return localConfigList;
  } else {
    return getDocs(docRef(docName))
      .then((querySnapshot) => {
        let config:any ={};
        querySnapshot.forEach((doc) => {
          config[doc.id] = doc.data();
          let data = doc.data();
          data.id = doc.id;
        })
        setConfigListToLocalStorage(config);
        return config;
      })
      .catch((e) => {
        console.log("error", e);
        alert("Unable to get Config List");
      });
  }
};
