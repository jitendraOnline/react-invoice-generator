import React, { FC, useEffect, useState } from "react";
import { getClientList } from "../storage/clients";
import {
  getDeposit,
  getDepositListFromLocalStorage,
} from "../storage/deposits";
import { auth } from "../storage/serverOperation";
import { displayCurrency, getItemListFromLocalStorage } from "../utils";
import ClientAdd from "./ClientAdd";
import UserCard from "./UserCard";

interface Client {
  id?: string;
  name: string;
  petName?: string;
  phoneNumber: string;
  address?: string;
  city: string;
  adharNumber?: string;
  notes?: string;
  invoiceHistory?: [
    {
      id: string;
      amount: string;
      totalProducts: number;
      createdAt: number;
      invoiceTitle: string;
      createdBy: string;
    }
  ];
  depositHistory?: {
    id: string;
    amount: number;
    createdAt: number;
    notes: "";
    clientId: "";
  };
}

interface Props {
  refresh: any;
  navigateToScreen?: any;
  clientId?: any;
}

const initialUser = {
  name: "",
  petName: "",
  phoneNumber: "",
  city: "",
  address: "",
  adharNumber: "",
  notes: "",
  invoiceHistory: [],
  depositHistory: [],
};

const ClientList: FC<Props> = ({ refresh, navigateToScreen, clientId }) => {
  const [selectedUser, setSelectedUser] = useState<any>({});
  const [userSearch, setUserSearch] = useState("");
  const [userList, setUserList] = useState([]);
  const [showUserList, setShowUserList] = useState(true);
  const [isbackButton, setIsBackButton] = useState(false);
  const [totalAmountSold, setTotalAmountSold] = useState(0);
  const [totalAmountDeposited, setTotalAmountDeposited] = useState(0);
  const [summaryList, setSummaryList] = useState({} as any);

  const getClinetListWrraper = (fromLocal: boolean) => {
    getClientList(fromLocal).then((data: any) => {
      setUserList(data);
      if (!fromLocal) {
        getOverAllDepositSummary(false);
      }
    });
  };

  useEffect(() => {
    getClinetListWrraper(true);
    let summary =
      getItemListFromLocalStorage("depositSummary");
     setSummaryList(summary);
  }, [showUserList]);

  useEffect(() => {
    getOverAllDepositSummary(true);
    if (clientId && !isbackButton) {
      userList.every((user: any) => {
        if (user.id === clientId) {
          setSelectedUser(user);
          setShowUserList(false);
        }
        return user.id !== clientId;
      });
    }
  }, [userList]);

  useEffect(() => {
    getOverAllDepositSummary(true);
    getClinetListWrraper(true);
  }, []);

  const getOverAllDepositSummary = (DoNotrefresh:boolean) => {
    getDeposit(DoNotrefresh).then((depositList: any) => {
      let depositTotal = 0;
      let soldTotal = 0;

      depositList.forEach((object: any) => {
        if (object.type === "invoice") {
          soldTotal = soldTotal + object.amount;
        } else {
          depositTotal = depositTotal + object.amount;
        }
      });
      setTotalAmountSold(soldTotal);
      setTotalAmountDeposited(depositTotal);
    });
  };

  return (
    <div style={{ padding: "5px", display: "flex", flexDirection: "column" }}>
      {showUserList ? (
        <div>
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
                onClick={() => getClinetListWrraper(false)}
              >
                Refresh
              </button>
              <button
                className="btn"
                style={{
                  background: "green",
                  color: "white",
                }}
                onClick={() => {
                  setShowUserList(false);
                  setSelectedUser(initialUser);
                }}
              >
                Add User
              </button>
            </div>
            <input
              type="text"
              placeholder="type name of customer"
              style={{ padding: "5px", width: "100%" }}
              value={userSearch}
              onChange={(event) => {
                setUserSearch(event.target.value);
              }}
            ></input>
            <div style={{ flex: "1", marginBottom: "10px", marginTop: "10px" }}>
              {!userSearch &&
                !selectedUser.id &&
                auth.currentUser?.email &&
                auth.currentUser?.email?.indexOf("admin") > -1 && (
                  <UserCard
                    refresh={() => getOverAllDepositSummary(false)}
                    isPositive={totalAmountDeposited + totalAmountSold}
                    cardData={{
                      title: displayCurrency(
                        totalAmountDeposited + totalAmountSold
                      ),
                      stitle: "Total Sales",
                      stitleValue: displayCurrency(-totalAmountSold),
                      stitle1: "Total reveived",
                      stitleValue1: displayCurrency(totalAmountDeposited),
                    }}
                  ></UserCard>
                )}
            </div>
            <div
              style={{
                flex: "1",
                marginBottom: "10px",
                height: "70vh",
                overflow: "scroll",
                padding: "10px",
                border: "1px solid green",
              }}
            >
              {userList
                .filter((obj: any) => {
                  if (!userSearch) {
                    return true && !!summaryList?.[obj.id];
                  } else {
                    return (
                      (obj.name
                        .toLowerCase()
                        .indexOf(userSearch.toLowerCase()) > -1 ||
                        (obj.petName &&
                        obj.petName
                          .toLowerCase()
                          .indexOf(userSearch.toLowerCase()) > -1)) &&
                      !!summaryList?.[obj.id]
                    );
                  }
                })
                .map((user: any) => {
                  return (
                    <div
                      className="userList"
                      onClick={() => {
                        setSelectedUser({ ...user });
                        setShowUserList(false);
                      }}
                      key={user.id}
                    >
                      <div
                        style={{
                          flex: 2,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {user.name}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {user.city}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {displayCurrency(
                          summaryList?.[user.id]?.totalPurchase +
                            summaryList?.[user.id]?.totalDeposit || 0
                        )}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {user.phoneNumber}
                      </div>
                      {/* <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {displayCurrency(user.amountPending||0)}
                      </div> */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <button
                          style={{ color: "blue", border: "1px solid blue" }}
                          className="btn"
                          onClick={(event) => {
                            setSelectedUser({ ...user });
                            navigateToScreen("createInvoice", "data", user);
                            event.stopPropagation();
                          }}
                        >
                          Create Invoice
                        </button>
                      </div>
                    </div>
                  );
                })}

              {userList
                .filter((obj: any) => {
                  if (!userSearch) {
                    return true && !summaryList?.[obj.id];
                  } else {
                    return (
                      (obj.name
                        .toLowerCase()
                        .indexOf(userSearch.toLowerCase()) > -1 ||
                         (obj.petName &&
                        obj?.petName
                          .toLowerCase()
                          .indexOf(userSearch.toLowerCase()) > -1)) &&
                      !summaryList?.[obj.id]
                    );
                  }
                })
                .map((user: any) => {
                  return (
                    <div
                      className="userList"
                      onClick={() => {
                        setSelectedUser({ ...user });
                        setShowUserList(false);
                      }}
                      key={user.id}
                    >
                      <div
                        style={{
                          flex: 2,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {user.name}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {user.city}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {displayCurrency(
                          summaryList?.[user.id]?.totalPurchase +
                            summaryList?.[user.id]?.totalDeposit || 0
                        )}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {user.phoneNumber}
                      </div>
                      {/* <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {displayCurrency(user.amountPending||0)}
                      </div> */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <button
                          style={{ color: "blue", border: "1px solid blue" }}
                          className="btn"
                          onClick={(event) => {
                            setSelectedUser({ ...user });
                            navigateToScreen("createInvoice", "data", user);
                            event.stopPropagation();
                          }}
                        >
                          Create Invoice
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
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
              onClick={() => {
                setIsBackButton(true);
                setSelectedUser({});
                setShowUserList(true);
              }}
            >
              Back
            </button>
          </div>
          <ClientAdd
            selectedUser={selectedUser}
            navigateToScreen={navigateToScreen}
          ></ClientAdd>
        </div>
      )}
    </div>
  );
};

export default ClientList;
