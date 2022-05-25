import React, { FC, useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

interface Props {
  data: any;
  columnDefs: any;
  createOrUpdateAction?: any;
  typeOfList?: any;
  disableActions?: boolean;
  refresh?: any;
}

const InvoiceList: FC<Props> = ({
  data,
  createOrUpdateAction,
  columnDefs,
  typeOfList,
  disableActions,
  refresh,
}) => {
  const gridRef = useRef();
  const onSelectionChanged = useCallback(() => {
    const selectedRows = (gridRef as any).current.api.getSelectedRows();
    createOrUpdateAction &&
      createOrUpdateAction(selectedRows[0].id, selectedRows[0]);
  }, [createOrUpdateAction]);

  const listOfItemsTobeShown = disableActions
    ? data
    : data && data.filter((item: any) => item && !item.isDeleted);
  return (
    <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          padding: "20px 0px",
          justifyContent: `${refresh ? "space-between" : ""}`,
        }}
      >
        {!disableActions && (
          <button
            className="btn"
            style={{ background: "green", color: "white" }}
            onClick={() => {
              createOrUpdateAction("createNew");
            }}
          >
            Create {typeOfList}
          </button>
        )}
        {refresh && (
          <button
            className="btn"
            style={{ background: "green", color: "white", margin: "0px 10px" }}
            onClick={refresh}
          >
            Refresh Data
          </button>
        )}
      </div>
      <AgGridReact
        pagination={true}
        paginationAutoPageSize={true}
        getRowStyle={(params: any) => {
          if (
            params.data.paymentStatus &&
            params.data.paymentStatus === "Paid"
          ) {
            return { background: "rgb(0 128 0 / .3)" };
          } else if (
            params.data.partialAmountPaid &&
            parseFloat(params.data.partialAmountPaid || "0") > 0
          ) {
            return { background: "rgb(255 204 0 /.3)" };
          }
        }}
        rowStyle={{ background: "white" }}
        ref={gridRef as any}
        rowData={listOfItemsTobeShown}
        columnDefs={columnDefs}
        rowSelection={"single"}
        onSelectionChanged={onSelectionChanged}
      ></AgGridReact>
    </div>
  );
};

export default InvoiceList;
