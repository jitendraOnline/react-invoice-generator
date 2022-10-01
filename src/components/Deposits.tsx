import React, { FC, useEffect, useState } from "react";
import View from "./View";
import EditableInput from "./EditableInput";
import EditableTextarea from "./EditableTextarea";
import { addDepositData, getDeposit } from "../storage/deposits";
import { displayCurrency, displayDate, getDepositedMessage, getWhatsApiAppUrl, getWhatsAppUrl } from "../utils";

interface Deposit {
  id?: string;
  clientName: string;
  clientId: string;
  amount: string;
  dateOfDeposit: number;
  depositer: string;
  notes: string;
  paymentMode: string;
  accountNumber: string;
}

const deposit = {
  clientName: "",
  clientId: "",
  amount: "",
  dateOfDeposit: "",
  depositer: "",
  paymentMode:"",
  accountNumber:"",
  bank:"",
  notes: "",
};

interface Props {
  selectedUser: any;
  hideDeposit: any;
  currentAmountDue?:any;
}

const DepositAdd: FC<Props> = ({
  selectedUser,
  hideDeposit,
  currentAmountDue,
}) => {
  const [depositState, setDepositState] = useState({
    ...deposit,
    clientName: selectedUser.name,
    clientId: selectedUser.id,
  });
  const handleChange = (nameOfField: keyof Deposit, value: string) => {
    let newDeposit = { ...depositState };
    (newDeposit as any)[nameOfField] = value;
    setDepositState(newDeposit);
  };

  const addDeposit = () => {
    if (
      depositState &&
      depositState.amount &&
      depositState.clientId &&
      depositState.clientName
    ) {
      let preproccessedObject = {
        ...depositState,
        amount: parseInt(depositState.amount),
      };
      addDepositData(preproccessedObject)
        .then(() => {
          alert("Amount deposited successfully.");
          setDepositState({
            ...deposit,
            clientName: selectedUser.name,
            clientId: selectedUser.id,
          });
          hideDeposit();
        })
        .catch(() => {
          alert("Unable to deposit. Please try after sometime");
        });
    } else {
      alert("Please add amount or select the client from list.");
    }
  };

  return (
    <div style={{ padding: "5px" }}>
      <div>
        <View>
          {/* <div style={{ display: "flex", flexDirection: "row" }}>
            <EditableInput value="Client Name" />
            <EditableInput placeholder="Name" value={depositState.clientName} />
          </div> */}

          <div style={{ display: "flex", flexDirection: "row" }}>
            <EditableInput value="Amount" />
            <EditableInput
              placeholder="Amount"
              type="number"
              value={depositState.amount}
              onChange={(value) => handleChange("amount", value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "row" }}>
            <EditableInput value="Payemnt Type" />
            <EditableInput
              placeholder="Cash or bank account"
              value={depositState.paymentMode}
              onChange={(value) => handleChange("paymentMode", value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "row" }}>
            <EditableInput value="Depositer" />
            <EditableInput
              placeholder="Who is paying"
              value={depositState.depositer}
              onChange={(value) => handleChange("depositer", value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "row" }}>
            <EditableInput value="Date" />
            <EditableInput
              placeholder="City"
              value={displayDate({ createdDate: new Date().getTime() })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "row" }}>
            <EditableInput value="Notes" />
            <EditableTextarea
              placeholder="Notes"
              value={depositState.notes}
              onChange={(value) => handleChange("notes", value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => {
                hideDeposit(false);
              }}
              style={{ color: "red", border: "1px solid red" }}
              className="btn"
            >
              Cancell
            </button>
            <a
              style={{ textDecoration: "none !important" }}
              href={encodeURI(
                getWhatsAppUrl(
                  selectedUser.phoneNumber,
                  getDepositedMessage(
                    displayCurrency(depositState.amount),
                    displayCurrency(
                      -currentAmountDue - parseInt(depositState.amount)
                    )
                  )
                )
              )}
              target="_blank"
            >
              <button
                onClick={() => {
                  addDeposit();
                }}
                style={{ color: "green", border: "1px solid green" }}
                className="btn"
              >
                Deposit
              </button>
            </a>
          </div>
        </View>
      </div>
    </div>
  );
};

export default DepositAdd;
