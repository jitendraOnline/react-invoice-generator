import React, { FC, useEffect, useState } from "react";
import { Font } from "@react-pdf/renderer";
import View from "./View";
import InventoryAdd from "./InventoryAdd";
import { displayDate } from "../utils";
import { getInventoryList } from "../storage/inventory";

interface InvertoryItem {
  productName?: string;
  productId?: string;
  quantity?: string;
  quantityRemaning?: string;
  stockAddedDate?: Date;
  expiryDate: Date | undefined;
  addedBy?: string;
  shopNumber?: string;
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
  refresh:any;
}

const InventoryList: FC<Props> = ({
  productList1,
  addDoc1,
  refresh,
}) => {
  const [inventoryHistory, setInventoryHistory] = useState('');
  const [showInventoryList, setShowInventoryList] = useState(true);
  const [inventorySearch, setInventorySearch] =
    useState('');
  const [inventoryList, setInventoryList] = useState([]);

  const getInventoryListWrapper = (refresh: boolean) => {
     getInventoryList(refresh)?.then((data: any) => {
      setInventoryList(data);
    });
  };

  useEffect(() => {
     getInventoryListWrapper(true);
  }, [showInventoryList]);
  
  useEffect(()=>{
     getInventoryListWrapper(true);
  },[])

  return (
    <div>
      {showInventoryList ? (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px",
            }}
          >
            <button
              className="btn"
              style={{
                background: "green",
                color: "white",
              }}
              onClick={()=>{getInventoryListWrapper(false)}}
            >
              Refresh
            </button>
            <button
              className="btn"
              style={{
                background: "green",
                color: "white",
              }}
              onClick={() => setShowInventoryList(false)}
            >
              Add Inventory
            </button>
          </div>

          <View>
            <input
              type="text"
              placeholder="type name of product"
              style={{ padding: "5px", width: "100%" }}
              onChange={(event) => {
                setInventorySearch(event.target.value);
              }}
            ></input>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxHeight: "75vh",
                overflow: "scroll",
                border:"1px solid green",
                marginTop:"10px"
              }}
            >
              {inventoryList
                .filter((obj: any) => {
                  if (inventorySearch === "") {
                    return true;
                  } else {
                    return (
                      obj.productName
                        .toLowerCase()
                        .indexOf(inventorySearch.toLowerCase()) > -1
                    );
                  }
                })
                .map((obj: any, index: number) => {
                  return (
                    <div
                      onClick={() => {
                        inventoryHistory !== obj.productId
                          ? setInventoryHistory(obj.productId)
                          : setInventoryHistory("");
                      }}
                      className="userList"
                      style={{
                        flexDirection: "column",
                      }}
                      key={obj.productId}
                    >
                      <div className="userList">
                        <div
                          style={{
                            padding: "5px",
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          Product Name: {obj.productName}
                        </div>
                        <div
                          style={{
                            padding: "5px",
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          Total : {obj.quantityRemaning} /{obj.totalUnits}
                          {"   "}
                          <span
                            style={{ paddingLeft: "10px", fontWeight: 500 }}
                          >
                            {obj.quantityRemaning &&
                              obj.totalUnits &&
                              (
                                (-obj.quantityRemaning / obj.totalUnits) *
                                100
                              ).toFixed(2)}
                            % Sold
                          </span>
                        </div>
                        <div
                          style={{
                            padding: "5px",
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          Shop 1 : {obj.ShopRemining1} / {obj.Shop1}
                        </div>
                        <div
                          style={{
                            padding: "5px",
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          Shop 2 : {obj.ShopRemining2} / {obj.Shop2}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "5px",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {inventoryHistory === obj.productId &&
                          obj.history
                            .sort(
                              (a: any, b: any) => b.createdDate - a.createdDate
                            )
                            .map((hist: any) => {
                              return (
                                <div>
                                  {hist.type === "sold" ? (
                                    <p style={{ color: "red" }}>
                                      Sold {hist.quantity} Units at Shop number{" "}
                                      {hist.shopNumber} on {displayDate(hist)}
                                    </p>
                                  ) : (
                                    <p style={{ color: "green" }}>
                                      Added
                                      {hist.type === "return"
                                        ? `(returned by ${hist.clientName})`
                                        : ""}{" "}
                                      {hist.quantity} Units at Shop number{" "}
                                      {hist.shopNumber} on {displayDate(hist)}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </View>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px",
            }}
          >
            <button
              className="btn"
              style={{
                background: "green",
                color: "white",
                marginRight: "10px",
              }}
              onClick={() => setShowInventoryList(true)}
            >
              Back
            </button>
          </div>
          <InventoryAdd
            productList1={productList1}
            addDoc1={addDoc1}
          ></InventoryAdd>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
