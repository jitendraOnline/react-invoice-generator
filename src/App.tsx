import React, { useState, useEffect } from 'react'
import InvoicePage from './components/InvoicePage'


import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
 import { getFirestore } from 'firebase/firestore';
 import { collection, addDoc, getDoc ,doc,getDocs, setDoc, deleteDoc } from "firebase/firestore";
 import ItemDetails from './data/ItemDetails';
import InvoiceList from './components/invoiceList';
import { initialInvoice  } from './data/initialData'
import ProductAddForm from './components/ProductAdd';
import { ProductType } from './data/types';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAreQizUFWr0-KIKnUg3uMeZFk5VxbVqXw",
  authDomain: "shree-sai-kirpa.firebaseapp.com",
  projectId: "shree-sai-kirpa",
  storageBucket: "shree-sai-kirpa.appspot.com",
  messagingSenderId: "3045994360",
  appId: "1:3045994360:web:1e4413c7e5bda70e39a28d",
  measurementId: "G-JV3S93BRL6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

 const db = getFirestore(app);

 const addDoc1 = (data:any,collectionName:string) => {
 return  addDoc(collection(db,collectionName), 
    data 
  ).then((data)=>{
    console.log("added data",data)
  });
 }

 

 const docRef = (collectionName:string) =>{
  return collection(db, collectionName);
 } 

 const setDoc1 = (data:any,collectionName:string,id:any) => {
  const docRef = doc(db, collectionName, id);
  return  setDoc(docRef, 
     data 
   ).then((data)=>{
     console.log("updated data",data)
   });
  }

  const deleteDoc1 = (collectionName:string,id:any) => {
    const docRef = doc(db, collectionName, id);
    return  deleteDoc(docRef)
     .then((data)=>{
       console.log("deleted data",data)
     });
    }

const getDataById = (collectionName:string,id:any) =>{
  const docRef = doc(db, collectionName, id);
  return getDoc(docRef);
}

const invoiceListColumn = [
  { field: "clientName", filter: 'agTextColumnFilter' ,sortable: true, comparator: (valueA :any, valueB:any, nodeA:any, nodeB:any, isInverted:any) => {
    if (valueA == valueB) return 0;
    return (valueA > valueB) ? 1 : -1;
}},{
  field:'clientAddress2',
  headerName:'Phone Number'
},
  { field: "invoiceDate", filter: 'agDateColumnFilter', sortable: true,sortingOrder: ['desc', 'asc']  ,comparator: (valueA :any, valueB:any, nodeA:any, nodeB:any, isInverted:any) => {
    if(!valueA){
      return -1;
    }else if(!valueB){
      return 1
    }
    const cellDateA = new Date(valueA);
    const cellDateB = new Date(valueB);
    if (cellDateA == cellDateB) return 0;
    return (cellDateA > cellDateB) ? 1 : -1;
}, filterParams: {
    // provide comparator function
    comparator: (filterLocalDateAtMidnight: any, cellValue:any) => {
        const dateAsString = cellValue;

        if (dateAsString == null) {
            return 0;
        }

        // In the example application, dates are stored as dd/mm/yyyy
        // We create a Date object for comparison against the filter date

        const cellDate = new Date(cellValue)

        // Now that both parameters are Date objects, we can compare
        if (cellDate < filterLocalDateAtMidnight) {
            return -1;
        } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
        }
        return 0;
    }
}},
  { field: "paymentType" ,filter: 'agTextColumnFilter' },
  { field: "totalAmount" , sortable: true, filter: 'agNumberColumnFilter' },
  {field:"paymentStatus"}
];

const productLisColumnt = [
{ field: "text" , filter: 'agTextColumnFilter',sortable: true, comparator: (valueA :any, valueB:any, nodeA:any, nodeB:any, isInverted:any) => {
  if (valueA == valueB) return 0;
  return (valueA > valueB) ? 1 : -1;
},sortingOrder: ['desc', 'asc']},
{ field: "cost", filter: 'agNumberColumnFilter',  sortable: true,},
{ field: "cost_cash" , filter: 'agNumberColumnFilter', sortable: true,},
];

function App() {
 
  const [productList, setProductList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [intialData, setintialData] = useState();
  const [showInvoice, setShowInvoice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Partial<ProductType>>({id:''});
  const [deletedProductList, setDeletedProductList] = useState([]);
  

  const [columnDefs, setColumnDefs] = useState(invoiceListColumn as any);



  

  const getInvoiceList = () => {
    setShowInvoice('invoice');
    setColumnDefs(invoiceListColumn);
    getDocs(docRef("invoiceList")).then((querySnapshot)=>{
      let list:any = [];
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          let data = doc.data();
          data.totalAmount = 0;
          data.productLines.forEach((pdItem:any)=>{
            const quantityNumber = parseFloat(pdItem.quantity)
            const rateNumber = parseFloat(pdItem.rate)
            const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;
            data.totalAmount =data.totalAmount+amount;
          })
          data.id = doc.id;
          list.push(data);
        });
        try{
          const sortedList = list.sort((obj1:any,obj2:any)=>{
            let valueA = obj1 && obj1.invoiceDate ;
            let valueB =  obj2 && obj2.invoiceDate;
            if(!valueA){
              return 1;
            }else if(!valueB){
              return -1
            }
            const cellDateA = new Date(valueA);
            const cellDateB = new Date(valueB);
            if (cellDateA == cellDateB) return 0;
            return (cellDateA > cellDateB) ? -1 : 1;
          })
          setInvoiceList(sortedList);
        }
        catch(e){
          setInvoiceList(list);
        }
      //setInvoiceList(list);
    })
  }

  const getInvoice =(id:any) => {  
    if(id==='createNew'){
      setintialData(initialInvoice as any)
      setShowInvoice('');
    }
    else{
      getDataById('invoiceList',id).then((docSnap)=>{
        if (docSnap.exists()) {
          let invoiceData = docSnap.data();
          setintialData({...invoiceData,id} as any)
          setShowInvoice('');
        } 
      })
    }
  }

  const showInvoiceList =(id:any) => { 
    setTimeout(()=>{
      getInvoiceList();
    },100)
  }

  const updateInvoiceData=(data:any)=>{
    return setDoc1(data,"invoiceList",data.id);
  }

  //get product list and perform operation
  const getList = () => {
    setProductList([]);
    setTimeout(()=>{
      getDocs(docRef("productList")).then((querySnapshot)=>{
        let list:any = [];
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          let data = doc.data();
          data.id = doc.id;
          if(!data.isDeleted){
            list.push(data);
          }
        });
        setProductList(list.sort((a: { text: any; },b: { text: any; })=>a.text>b.text?1:-1));
       
      }
      )
    },1000)
  }

  const getProductList = (isToshowDeletedProduct?:boolean) => {
    setProductList([]);
    if(isToshowDeletedProduct){
      setShowInvoice('deletedproduct');
    }else{
      setShowInvoice('product');
    }
    setColumnDefs(productLisColumnt);
    setTimeout(()=>{
      getDocs(docRef("productList")).then((querySnapshot)=>{
        let list:any = [];
        let deletedList:any = [];
          querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            if(!data.isDeleted){
              list.push(data);
            }
            else{
              deletedList.push(data);
            }
          });
        setProductList(list.sort((a: { text: any; },b: { text: any; })=>a.text>b.text?1:-1));
        setDeletedProductList(deletedList.sort((a: { text: any; },b: { text: any; })=>a.text>b.text?1:-1));
      })
    },1000)
   
  }

  const getProductData = (id:any,data:ProductType) =>{
    setSelectedProduct(data);
    setShowInvoice('showProductForm');
  }

  const updateProductData=(data:any)=>{
    return setDoc1(data,"productList",data.id);
  }

  const deleteProductData=(data:any)=>{
    return setDoc1({...data,isDeleted:true},"productList",data.id);
  }

  const undeleteProductData=(data:any)=>{
    return setDoc1({...data,isDeleted:false},"productList",data.id);
  }

  const showProductList = () =>{
    setSelectedProduct({});
    getProductList();
    
  }

  const showDeletedProductList = () =>{
    setSelectedProduct({});
    getProductList(true);
  }

  useEffect(()=>{
    getList();
  },[])


  return (
    <div  className='mainApp' style={{width:'80wh',height:'100vh'}}>
      <div style={{display:'flex',background:'green',color:'white'}}>
          <div className='menuItemContainer'>
                <div style={{padding:'10px',margin:'10px',cursor:'pointer',borderBottom:'2px solid #ccc',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}  onClick={()=>showProductList()}>
                    <span className="material-icons">
                      category
                    </span>
                      Products
                </div>
                <div style={{padding:'10px',margin:'10px',cursor:'pointer',borderBottom:'2px solid #ccc',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}  onClick={getInvoiceList}>
                    <span className="material-icons">
                    receipt_long
                    </span>
                    Invoices
              </div> 
              <div style={{padding:'10px',margin:'10px',cursor:'pointer',borderBottom:'2px solid #ccc',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}} onClick={getList}>
                    <span className="material-icons">
                          refresh
                    </span>
                    Refresh
                </div> 
              <div style={{padding:'10px',margin:'10px',cursor:'pointer',borderBottom:'2px solid #ccc',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}  onClick={()=>showDeletedProductList()}>
                    <span className="material-icons">
                    delete
                    </span>
                    Recover
              </div> 
          </div>
      </div>
      <div  style={{display:'flex',alignItems:'center',justifyContent:'top',flex:'1',height:'100%',overflow:'scroll',flexDirection:'column'}}>
          <div className='app'>
          {/* <h1 className="center fs-30" style={{color:'green'}}>OM SAI KRISHI SEVA KENDRA 
          
          </h1> */}
          { !showInvoice ? <InvoicePage data={intialData?intialData:false} addInvoiceData={addDoc1} productList={productList} showInvoiceList= {showInvoiceList}  productListForDropDown={productList} updateInvoiceData={updateInvoiceData}/>:null}
          { showInvoice ==='showProductForm' &&  <ProductAddForm selectedProduct={selectedProduct} addProduct={addDoc1} showProductList= {showProductList} updateProduct={updateProductData} deleteProductData={deleteProductData} showDeletedProductList={showDeletedProductList} recoverProductData={undeleteProductData}></ProductAddForm>}

          { showInvoice ==='invoice' &&  <InvoiceList data={invoiceList} getInvoice={getInvoice} columnDefs={columnDefs} typeOfList={showInvoice} ></InvoiceList>}
          { showInvoice === 'product' && <InvoiceList data={productList}  columnDefs={columnDefs} getInvoice={getProductData}  typeOfList={showInvoice}></InvoiceList>}
          { showInvoice === 'deletedproduct' && <InvoiceList data={deletedProductList}  columnDefs={columnDefs} getInvoice={getProductData}  typeOfList={showInvoice} disableActions={true}></InvoiceList>}
         </div>
         <div style={{height:'50px'}}>
              
         </div>
      </div>
 
    </div>
  )
}

export default App
