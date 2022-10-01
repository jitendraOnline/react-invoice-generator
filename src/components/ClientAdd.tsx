import React, { FC, useEffect, useState } from "react";
import View from "./View";
import EditableInput from "./EditableInput";
import EditableTextarea from "./EditableTextarea";
import DepositAdd from "./Deposits";
import { addClientData, updateClientData } from "../storage/clients";
import { getDeposit } from "../storage/deposits";
import {
  displayCurrency,
  displayDate,
  getItemListFromLocalStorage,
  getMessage,
  getWhatsAppUrl,
} from "../utils";
import UserCard from "./UserCard";
import InvoicePageReturn from "./InvoicePageReturn";
import { initialInvoice } from "../data/initialData";
import { getProductListFromLocalStorage } from "../storage/product";

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
  selectedUser: any;
  navigateToScreen: any;
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

const ClientAdd: FC<Props> = ({ selectedUser, navigateToScreen }) => {
  const [userData, setUserData] = useState(
    selectedUser?.id ? selectedUser : initialUser
  );
  const [editUserData, toggleEditUserData] = useState(!selectedUser?.id);
  const [addDeposit, toggleAddDeposit] = useState(false);
  const [showRetrunItems, toggleRetrunItems] = useState(false);
  const [totalAmountSold, setTotalAmountSold] = useState(0);
  const [totalAmountDeposited, setTotalAmountDeposited] = useState(0);
  const productList = getProductListFromLocalStorage();
  const [depositList, setDepositList] = useState([]);

  const handleChange = (nameOfField: keyof Client, value: string) => {
    let newUserData = { ...userData };
    (newUserData as any)[nameOfField] = value;
    setUserData(newUserData);
  };

  useEffect(() => {
    getDeposit(true).then((data: any) => {
      setDepositList(
        data.filter((deposit: any) => {
          return deposit.clientId === selectedUser.id;
        })
      );
      let summary =
        getItemListFromLocalStorage("depositSummary")[selectedUser.id];
      setTotalAmountSold(summary ? summary.totalPurchase : 0);
      setTotalAmountDeposited(summary ? summary.totalDeposit : 0);
    });
  }, [selectedUser, showRetrunItems, addDeposit]);

  const addUser = () => {
    if (userData && userData.name && userData.phoneNumber && userData.city) {
      let proccessedData = {
        ...userData,
        name: userData.name.trim(),
        city: userData.city.trim(),
      };
      proccessedData.id
        ? updateClientData(proccessedData).then(() => {
            //setUserData(initialUser);
            alert("User Updated successfully.");
          })
        : addClientData(proccessedData).then(() => {
            setUserData(initialUser);
            alert("User Added successfully.");
          });
    } else {
      alert("Please enter name, city and phoneNumber");
    }
  };

  return (
    <div style={{ padding: "5px" }}>
      <div
        style={{
          border: "1px solid blue",
          padding: "10px",
          position: "relative",
        }}
      >
        {selectedUser.id && !editUserData && (
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              color: "blue",
            }}
            title="edit user details"
            onClick={() => toggleEditUserData(true)}
          >
            <span className="material-icons">edit</span>
          </div>
        )}

        <View>
          <div style={{ display: "flex" }}>
            <div style={{ flex: "2" }}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <EditableInput value="Client Name" />
                <EditableInput
                  placeholder="Name"
                  value={userData.name}
                  onChange={(value) =>
                    editUserData && handleChange("name", value)
                  }
                />
              </div>

              <div style={{ display: "flex", flexDirection: "row" }}>
                <EditableInput value="Relation/Salutation" />
                <EditableInput
                  placeholder="Pet name"
                  value={userData.petName}
                  onChange={(value) =>
                    editUserData && handleChange("petName", value)
                  }
                />
              </div>

              <div style={{ display: "flex", flexDirection: "row" }}>
                <EditableInput value="Address" />
                <EditableTextarea
                  placeholder="Address"
                  value={userData.address}
                  onChange={(value) =>
                    editUserData && handleChange("address", value)
                  }
                />
              </div>

              <div style={{ display: "flex", flexDirection: "row" }}>
                <EditableInput value="City" />
                <EditableInput
                  placeholder="City"
                  value={userData.city}
                  onChange={(value) =>
                    editUserData && handleChange("city", value)
                  }
                />
              </div>

              <div style={{ display: "flex", flexDirection: "row" }}>
                <EditableInput value="Phone Number" />
                <EditableInput
                  placeholder="Phone"
                  type="number"
                  value={userData.phoneNumber}
                  onChange={(value) =>
                    editUserData && handleChange("phoneNumber", value)
                  }
                />
              </div>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <EditableInput value="Notes" />
                <EditableTextarea
                  placeholder="Notes"
                  value={userData.notes}
                  onChange={(value) =>
                    editUserData && handleChange("notes", value)
                  }
                />
              </div>
            </div>
            {selectedUser.id && !editUserData && (
              <div style={{ flex: "2" }}>
                <UserCard
                  isPositive={totalAmountDeposited + totalAmountSold}
                  cardData={{
                    title: displayCurrency(
                      totalAmountDeposited + totalAmountSold
                    ),
                    stitle: "Total Purchased",
                    stitleValue: displayCurrency(-totalAmountSold),
                    stitle1: "Total Deposited",
                    stitleValue1: displayCurrency(totalAmountDeposited),
                  }}
                ></UserCard>
              </div>
            )}
          </div>

          {editUserData && (
            <div
              style={{
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {selectedUser.id && (
                <button
                  onClick={() => toggleEditUserData(false)}
                  style={{ color: "red", border: "1px solid red" }}
                  className="btn"
                >
                  Cancell
                </button>
              )}
              <button
                onClick={() => {
                  console.log(userData);
                  addUser();
                }}
                style={{ color: "green", border: "1px solid green" }}
                className="btn"
              >
                {selectedUser.id ? "Update" : "Add"}
              </button>
            </div>
          )}
          {selectedUser.id && !editUserData && (
            <div
              style={{
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn marginTopBotton5"
                onClick={() => {
                  toggleAddDeposit(!addDeposit);
                }}
                style={{
                  color: ` ${addDeposit ? "red" : "blue"}`,
                  border: ` ${addDeposit ? "1px solid red" : "1px solid blue"}`,
                }}
              >
                {addDeposit ? "Hide" : "Add"} Deposit
              </button>
              <button
                className="btn marginTopBotton5"
                style={{
                  color: "green",
                  border: "1px solid green",
                }}
              >
                <a
                  style={{ textDecoration: "none !important" }}
                  href={getWhatsAppUrl(
                    userData.phoneNumber,
                    getMessage(
                      displayCurrency(totalAmountDeposited + totalAmountSold)
                    )
                  )}
                  target="_blank"
                >
                  Reminder
                </a>
              </button>
              <button
                className="btn marginTopBotton5"
                onClick={() => {
                  toggleRetrunItems(!showRetrunItems);
                }}
                style={{
                  color: ` ${showRetrunItems ? "red" : "orange"}`,
                  border: ` ${
                    showRetrunItems ? "1px solid red" : "1px solid orange"
                  }`,
                }}
              >
                Return Items
              </button>
              <button
                className="btn marginTopBotton5"
                onClick={() => {
                  navigateToScreen("createInvoice", "data", selectedUser);
                }}
                style={{ color: "red", border: "1px solid red" }}
              >
                Create Invoice
              </button>
            </div>
          )}
        </View>
      </div>
      <div>
        {selectedUser.id && addDeposit && (
          <div
            style={{
              padding: "10px",
              border: "1px solid green",
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            <DepositAdd
              selectedUser={selectedUser}
              hideDeposit={toggleAddDeposit}
              currentAmountDue={totalAmountDeposited + totalAmountSold}
            ></DepositAdd>
          </div>
        )}
        {selectedUser.id && showRetrunItems && (
          <div
            style={{
              padding: "10px",
              border: "1px solid green",
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            <InvoicePageReturn
              data={{
                ...initialInvoice,
                title: "Return",
                clientName: selectedUser.name,
                clientAddress2: selectedUser.phoneNumber,
                clientAddress: selectedUser.city,
                clientId: selectedUser.id,
                taxLabel: "Sale Tax (0%)",
                termLabel: "Note",
                term: "All the return items will be added to Inventory and users money will be deposited.",
              }}
              hideReturn={toggleRetrunItems}
              productList={productList}
              productListForDropDown={productList}
            ></InvoicePageReturn>
          </div>
        )}
        {}
      </div>
      {depositList.length > 0 && selectedUser.id && (
        <div
          style={{
            padding: "10px",
            border: "1px solid orange",
            marginTop: "10px",
          }}
        >
          {depositList
            .filter((deposit: any) => {
              return deposit.clientId === selectedUser.id;
            })
            .map((depositItem: any, index: any) => {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px",
                    borderTop: `${index !== 0 ? "1px solid orange" : ""}`,
                    color: `${depositItem.amount < 0 ? "red" : "green"}`,
                  }}
                >
                  <div style={{ padding: "5px", flex: "1" }}>{index + 1}</div>
                  <div style={{ padding: "5px", flex: "1" }}>
                    {displayDate(depositItem)}
                  </div>
                  {depositItem.type === "invoice" ? (
                    <div
                      style={{ padding: "5px", flex: "2" }}
                      onClick={() => {
                        navigateToScreen(
                          "createInvoice",
                          "id",
                          depositItem.invoiceId
                        );
                      }}
                    >
                      <a href="javascript:void(0)">Open Invoice</a>
                    </div>
                  ) : (
                    <div style={{ padding: "5px", flex: "2" }}>
                      {depositItem.type === "return"
                        ? "Item returned"
                        : "Deposited"}{" "}
                      - {depositItem.paymentMode}
                    </div>
                  )}
                  <div style={{ padding: "5px", flex: "1" }}>
                    {depositItem.createdBy}
                  </div>
                  <div style={{ padding: "5px", flex: "1" }}>
                    {displayCurrency(depositItem.amount)}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default ClientAdd;
