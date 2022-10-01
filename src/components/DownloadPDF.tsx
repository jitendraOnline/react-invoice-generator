import React, { FC, useEffect, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Invoice } from '../data/types'
import InvoicePage from './InvoicePage'
import { displayDate } from '../utils'

interface Props {
  data: Invoice,
  buttonName:any,
  returnSlip?:boolean
}

const Download: FC<Props> = ({ data, buttonName, returnSlip }) => {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(false);

    const timeout = setTimeout(() => {
      setShow(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [data]);

  return (
    <button
      className={"download-pdf btn" + (!show ? "loading" : "")}
      style={{ background: "green", color: "white", marginLeft: "10px" }}
    >
      {buttonName}
      <div title="Save PDF" id="pdfDownload">
        {show && (
          <PDFDownloadLink
            document={<InvoicePage pdfMode={true} data={data} />}
            fileName={`${
              data.clientName
                ? (returnSlip ? "Return-" : "") +
                  data.clientName.toLowerCase() +
                  "-" +
                  displayDate({ createdDate: new Date().getTime() })
                : "invoice"
            }.pdf`}
            aria-label="Save PDF"
          ></PDFDownloadLink>
        )}
      </div>
    </button>
  );
};

export default Download
