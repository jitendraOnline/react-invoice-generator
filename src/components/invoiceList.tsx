import React, { FC, useState, useRef ,useCallback} from 'react'
import { AgGridReact} from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

interface Props {
  data: any,
  columnDefs:any,
  getInvoice?:any,
  typeOfList?:any,
  disableActions?:boolean
}

const InvoiceList: FC<Props> = ({ data, getInvoice, columnDefs, typeOfList, disableActions }) => {
   const gridRef = useRef();
     const onSelectionChanged = useCallback(() => {
        const selectedRows =  (gridRef as any).current.api.getSelectedRows();
        getInvoice && getInvoice(selectedRows[0].id,selectedRows[0])
      }, [getInvoice]);
    const listOfItemsTobeShown = disableActions?data:data && data.filter((item:any)=>item && !item.isDeleted)
    return (
        <div className="ag-theme-alpine" style={{height: '80vh', width: '100%'}}>
            <AgGridReact
                ref={gridRef as any}
                rowData={listOfItemsTobeShown }
                columnDefs={columnDefs}
                rowSelection={'single'}
                onSelectionChanged={onSelectionChanged}>
            </AgGridReact>
            <div style={{display:'flex',flexDirection:'row-reverse',padding:'20px 0px'}}> 
            {!disableActions && <button className='btn' style={{background:'green',color:'white'}} onClick={()=>{getInvoice('createNew')}}>Create {typeOfList}</button>}
            </div>
            
        </div>
    );
}

export default InvoiceList
