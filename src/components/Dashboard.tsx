import React, { FC, useEffect, useState } from "react";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { Calendar, DateRangePicker } from "react-date-range";
import { Invoice } from "../data/types";

interface Props {
  InvoiceList?: any;
  children: React.ReactNode;
  setTableDataToBeShown: any;
}

const options = {
  chart: {
    type: "column",
  },
  title: {
    text: "Sales",
  },
  series: [
    {
      id: "mainSeries",
      name: "Amout",

      data: [],
    },
  ],
  xAxis: {
    categories: [],
  },
  yAxis: {
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: "<td><b>{point.y}</b></td></tr>",
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
  },
};

const Dashboard: FC<Props> = ({
  InvoiceList,
  children,
  setTableDataToBeShown,
}) => {
  const [invoiceState, setInvoiceState] = useState([]);
  const [distinctCities, setDistinctCities] = useState({});
  const [chartDataDistintCities, setChartDataDistintCities] = useState({});
  const [usersDistinct, setUsersDistinct] = useState({});
  const [chartDataUsersDistinct, setChartDataUsersDistinct] = useState({});
  const [selectionDate, setSelectionDate] = useState({
    startDate: new Date("Apr 01, 2022"),
    endDate: new Date(),
    key: "selection",
    isApplied: true,
  });
  const [summary, setSummary] = useState({
    totalSales: { totalAmount: 0, numberOfItems: 0 },
    totalSalesAtCashPrice: { totalAmount: 0, numberOfItems: 0 },
    totalSalesAtCreditPrice: { totalAmount: 0, numberOfItems: 0 },
    totalAmountReceived: { totalAmount: 0, numberOfItems: 0 },
    totalPaid: 0,
  });

  const [clientNameFilter, setclientNameFilter] = useState("");
  const [cityNameFilter, setCityNameFilter] = useState("");

  const calculateSummary = (invoiceState: any, setSummaryVlaue: any) => {
    let summaryObj: any = {};
    let totalSales = getTypeOfAmount(invoiceState, false, false, true);
    let totalSalesAtCashPrice = getTypeOfAmount(
      invoiceState,
      "paymentType",
      "Cash",
      true
    );
    let totalSalesAtCreditPrice = getTypeOfAmount(
      invoiceState,
      "paymentType",
      "Credit",
      true
    );
    let totalAmountReceived = getTypeOfAmount(
      invoiceState,
      "paymentStatus",
      "Paid",
      true
    );
    let totalPaid = getTotalAmountPaid(invoiceState);

    // summaryObj.totalSales =  ((totalSales as any).totalAmount as any).toLocaleString('en-IN') + "     ("+(totalSales as any).numberOfItems+") ";
    // summaryObj.totalSalesAtCashPrice = ((totalSalesAtCashPrice as any).totalAmount as any).toLocaleString('en-IN')+ "     ("+(totalSalesAtCashPrice as any).numberOfItems+")";;
    // summaryObj.totalSalesAtCreditPrice = ((totalSalesAtCreditPrice as any).totalAmount as any).toLocaleString('en-IN')+ "     ("+(totalSalesAtCreditPrice as any).numberOfItems+")";;
    // summaryObj.totalAmountReceived = ((totalAmountReceived as any).totalAmount as any).toLocaleString('en-IN')+ "     ("+(totalAmountReceived as any).numberOfItems+")";;
    summaryObj.totalSales = totalSales;
    summaryObj.totalSalesAtCashPrice = totalSalesAtCashPrice;
    summaryObj.totalSalesAtCreditPrice = totalSalesAtCreditPrice;
    summaryObj.totalAmountReceived = totalAmountReceived;
    summaryObj.totalPaid = totalPaid.totalAmount;
    setSummaryVlaue(summaryObj);
  };

  const getTotalAmountPaid = (data: any) => {
    let summary = {
      numberOfFullyPaid: 0,
      numberOfPartiallyPaid: 0,
      totalAmount: 0,
    };
    const dataList = JSON.parse(JSON.stringify(data));
    let amount = 0;
    let numberOfFullyPaid = 0;
    let numberOfPartiallyPaid = 0;
    dataList.forEach((invoice: any) => {
      console.log("i am the incoice ", invoice);
      if (invoice.paymentStatus === "Paid") {
        const newInvoice = sumProductLines(invoice);
        amount = amount + newInvoice.totalAmount;
        numberOfFullyPaid = numberOfFullyPaid + 1;
        console.log("i am the incoice Piad ", invoice);
      } else if (invoice.partialAmountPaid) {
        amount = amount + parseFloat(invoice.partialAmountPaid || "0");
        numberOfPartiallyPaid = numberOfPartiallyPaid + 1;
        console.log("i am the incoice partaillPaid ", invoice);
      }
    });
    summary.totalAmount = amount;
    summary.numberOfFullyPaid = numberOfFullyPaid;
    summary.numberOfPartiallyPaid = numberOfPartiallyPaid;
    return summary;
  };

  const getData = () => {
    const data = JSON.parse(localStorage.getItem("InvoiceList") || "[]");
    setInvoiceState(data);
  };

  const sumProductLines = (data: any) => {
    data.totalAmount = 0;
    data.productLines.forEach((pdItem: any) => {
      const quantityNumber = parseFloat(pdItem.quantity);
      const rateNumber = parseFloat(pdItem.rate);
      const amount =
        quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;
      data.totalAmount = data.totalAmount + amount;
    });
    return data;
  };

  const getTotalAmountPending = (dataList: any) => {
    let amount = 0;
    dataList.forEach((invoice: any) => {
      const newInvoice = sumProductLines(invoice);
      amount = amount + newInvoice.totalAmount;
    });
    return amount;
  };

  const getTypeOfAmount = (
    data: any,
    field?: any,
    fieldValue?: any,
    getCountAndAmount?: boolean
  ) => {
    let summary = {
      numberOfItems: 0,
      totalAmount: 0,
    };
    const dataToBeFiltered = JSON.parse(JSON.stringify(data));
    if (field) {
      const filteredList = dataToBeFiltered.filter((invoiceItem: any) => {
        if (
          fieldValue &&
          field &&
          typeof fieldValue === "string" &&
          invoiceItem[field]
        ) {
          return invoiceItem[field].toLowerCase() === fieldValue.toLowerCase();
        } else {
          return invoiceItem[field] === fieldValue;
        }
      });
      summary.numberOfItems = filteredList.length;
      summary.totalAmount = getTotalAmountPending(filteredList);
    } else {
      summary.numberOfItems = dataToBeFiltered.length;
      summary.totalAmount = getTotalAmountPending(dataToBeFiltered);
    }
    if (getCountAndAmount) {
      return summary;
    }
    return summary.totalAmount + summary.numberOfItems / 1000;
  };

  const renderCharts = (distinctCities: any, field: any) => {
    setChartDataDistintCities(JSON.parse(JSON.stringify(options)));
    let options1 = JSON.parse(JSON.stringify(options));
    Object.keys(distinctCities).map((data: any) => {
      console.log(data);
      (options1.xAxis.categories as any).push(data);
      (options1.series[0].data as any).push(
        getTypeOfAmount(invoiceState, field, data)
      );
    });
    console.log(options1);
    setChartDataDistintCities(options1);
  };

  const getDistinctTypes = (data: any, field: any, setFuntion: any) => {
    let distinctValuesOfField: any = {};
    data.forEach((data: any) => {
      let key = (data[field] + "").toLowerCase();
      if (distinctValuesOfField[key]) {
        distinctValuesOfField[key] = distinctValuesOfField[key] + 1;
      } else {
        distinctValuesOfField[key] = 1;
      }
    });
    setFuntion(distinctValuesOfField);
  };

  const filterTheData = () => {
    const data = JSON.parse(localStorage.getItem("InvoiceList") || "[]");
    const invoiceDataToBeSetToState = data.filter((invoice: Invoice) => {
      if (selectionDate && selectionDate.isApplied && clientNameFilter) {
        if (
          new Date(invoice.invoiceDate) >= selectionDate.startDate &&
          new Date(invoice.invoiceDate) <= selectionDate.endDate &&
          invoice.clientName.toLowerCase().indexOf(clientNameFilter) > -1
        ) {
          return true;
        } else {
          return false;
        }
      } else if (selectionDate && selectionDate.isApplied && cityNameFilter) {
        if (
          new Date(invoice.invoiceDate) >= selectionDate.startDate &&
          new Date(invoice.invoiceDate) <= selectionDate.endDate &&
          invoice.clientAddress.toLowerCase().indexOf(cityNameFilter) > -1
        ) {
          return true;
        } else {
          return false;
        }
      } else if (selectionDate && selectionDate.isApplied) {
        if (
          new Date(invoice.invoiceDate) >= selectionDate.startDate &&
          new Date(invoice.invoiceDate) <= selectionDate.endDate
        ) {
          return true;
        } else {
          return false;
        }
      } else if (clientNameFilter) {
        if (invoice.clientName.toLowerCase().indexOf(clientNameFilter) > -1) {
          return true;
        } else {
          return false;
        }
      } else if (cityNameFilter) {
        if (invoice.clientAddress.toLowerCase().indexOf(cityNameFilter) > -1) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    });
    setInvoiceState(invoiceDataToBeSetToState);
  };

  const resetFilters = () => {
    setSelectionDate({
      ...selectionDate,
      startDate: new Date("Mar 26, 2022"),
      endDate: new Date(),
      isApplied: true,
    });
    setclientNameFilter("");
    setCityNameFilter("");
  };

  const handleSelect = (ranges: any) => {
    console.log(ranges);
    setSelectionDate({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
      isApplied: true,
    });
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("InvoiceList") || "[]");
    setInvoiceState(data);
  }, []);

  useEffect(() => {
    filterTheData();
  }, [clientNameFilter, selectionDate, cityNameFilter]);

  useEffect(() => {
    if (clientNameFilter) {
      renderCharts(distinctCities, "clientAddress");
    } else if (cityNameFilter) {
      renderCharts(usersDistinct, "clientName");
    } else {
      renderCharts(distinctCities, "clientAddress");
    }
  }, [distinctCities]);

  useEffect(() => {
    getDistinctTypes(invoiceState, "clientName", setUsersDistinct);
    getDistinctTypes(invoiceState, "clientAddress", setDistinctCities);
    calculateSummary(invoiceState, setSummary);
    setTableDataToBeShown(invoiceState);
  }, [invoiceState]);

  return (
    <>
      <div className="dashBoard">
        <div style={{}}>
          <div className="filtersMenu">
            <div
              style={{
                padding: "5px",
                marginRight: "5px",
                flex: 1,
                display: "flex",
              }}
            >
              <input
                style={{ padding: "5px", marginRight: "5px", flex: 1 }}
                type="text"
                placeholder="type clientname"
                list="clientNameList"
                value={clientNameFilter}
                onChange={(event) => {
                  setclientNameFilter(event.target.value);
                  if (cityNameFilter) {
                    setCityNameFilter("");
                  }
                }}
              ></input>
              <datalist id="clientNameList">
                {Object.keys(usersDistinct).map((data) => (
                  <option value={data}></option>
                ))}
              </datalist>

              {!clientNameFilter && (
                <>
                  <input
                    style={{ padding: "5px" }}
                    type="text"
                    placeholder="type city"
                    list="cityNameList"
                    value={cityNameFilter}
                    onChange={(event) => {
                      setCityNameFilter(event.target.value);
                      if (clientNameFilter) {
                        setclientNameFilter("");
                      }
                    }}
                  ></input>
                  <datalist id="cityNameList">
                    {Object.keys(distinctCities).map((data) => (
                      <option value={data}></option>
                    ))}
                  </datalist>
                </>
              )}
            </div>
            <div style={{ padding: "5px", marginRight: "5px" }}>
              <button
                className="btn"
                style={{
                  background: "blue",
                  color: "white",
                  marginRight: "10px",
                }}
                onClick={() => {
                  setSelectionDate({
                    ...selectionDate,
                    startDate: new Date("Apr 01, 2022"),
                    endDate: new Date(),
                    isApplied: true,
                  });
                }}
              >
                Reset Date
              </button>
              <button
                className="btn"
                style={{ background: "blue", color: "white" }}
                onClick={resetFilters}
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
        <div className="mainContent">
          <div className="cards">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
              }}
            >
              <div style={{ fontSize: "20px" }}>Total Sales </div>{" "}
              <div style={{ fontSize: "20px" }}>
                {" "}
                {summary.totalSales.numberOfItems}{" "}
              </div>{" "}
              <div style={{ fontSize: "20px" }}>
                ₹ {summary.totalSales.totalAmount.toLocaleString("en-IN")}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
              }}
            >
              <div style={{ fontSize: "20px" }}>Total Cash </div>{" "}
              <div style={{ fontSize: "20px" }}>
                {" "}
                {summary.totalSalesAtCashPrice.numberOfItems}{" "}
              </div>
              <div style={{ fontSize: "20px" }}>
                ₹{" "}
                {summary.totalSalesAtCashPrice.totalAmount.toLocaleString(
                  "en-IN"
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
              }}
            >
              <div style={{ fontSize: "20px" }}>Total Credit </div>{" "}
              <div style={{ fontSize: "20px" }}>
                {" "}
                {summary.totalSalesAtCreditPrice.numberOfItems}
              </div>{" "}
              <div style={{ fontSize: "20px" }}>
                ₹{" "}
                {summary.totalSalesAtCreditPrice.totalAmount.toLocaleString(
                  "en-IN"
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
              }}
            >
              <div style={{ fontSize: "20px" }}>Fully Paid</div>{" "}
              <div style={{ fontSize: "20px" }}>
                {summary.totalAmountReceived.numberOfItems}
              </div>{" "}
              <div style={{ fontSize: "20px" }}>
                ₹{" "}
                {summary.totalAmountReceived.totalAmount.toLocaleString(
                  "en-IN"
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
              }}
            >
              <div style={{ fontSize: "20px", color: "green" }}>
                Total Paid :
              </div>{" "}
              <div style={{ fontSize: "20px", color: "green" }}>
                ₹ {summary.totalPaid.toLocaleString("en-IN")}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
              }}
            >
              <div style={{ fontSize: "20px", color: "red" }}>
                Amount Remaining :
              </div>{" "}
              <div style={{ fontSize: "20px", color: "red" }}>
                ₹{" "}
                {(
                  summary.totalSales.totalAmount - summary.totalPaid
                ).toLocaleString("en-IN")}
              </div>
            </div>

            {/* <h3>Total Cash : ₹ {summary.totalSalesAtCashPrice}</h3>
        <h3>Total Credit : ₹ {summary.totalSalesAtCreditPrice}</h3>
        <h3>Total Paid : ₹ {summary.totalAmountReceived}</h3> */}
          </div>
          <div className="cards">
            <DateRangePicker ranges={[selectionDate]} onChange={handleSelect} />
          </div>
        </div>

        <div className="analyticsWrapper">
          {!clientNameFilter && (
            <HighchartsReact
              className="barGraph"
              highcharts={Highcharts}
              options={chartDataDistintCities}
            />
          )}
          {clientNameFilter && children}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
