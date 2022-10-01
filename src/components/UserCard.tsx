import React, { FC, useState } from "react";

interface Props {
  cardData?: any;
  isPositive?:any;
  refresh?:any;
}

const UserCard: FC<Props> = ({ cardData, isPositive, refresh }) => {
  return (
    <div
      style={{ padding: `${refresh?"15px":"10px"}`, position: "relative" }}
      className={
        isPositive !== 0
          ? isPositive > 0
            ? "userCardGreen"
            : "userCardRed"
          : "userCardBlue"
      }
    >
     {refresh && <span
        className="material-icons"
        style={{ color: "white", fontSize: "14px",position:'absolute',top:'0',right:'0',cursor:'pointer' }}
        onClick={refresh}
      >
        refresh
      </span>}

      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            className="material-icons"
            style={{ color: "white", fontSize: "48px" }}
          >
            account_balance_wallet
          </span>
          <div style={{ display: "flex", fontSize: "24px", color: "white" }}>
            {/* <span
              className="material-icons"
              style={{ color: "white", fontSize: "24px" }}
            >
              currency_rupee
            </span> */}
            <div>{cardData.title}</div>
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              fontSize: "10px",
              justifyContent: "space-between",
              color: "white",
            }}
          >
            <div>{cardData.stitle}</div> <div>{cardData.stitleValue}</div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "10px",
              justifyContent: "space-between",
              color: "white",
            }}
          >
            <div>{cardData.stitle1}</div> <div>{cardData.stitleValue1}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
