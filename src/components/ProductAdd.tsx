import React, { FC, useState, useEffect } from 'react'
// import { Invoice, ProductLine } from '../data/types'
// import { initialInvoice, initialProductLine } from '../data/initialData'
import EditableInput from './EditableInput'
// import EditableSelect from './EditableSelect'
// import EditableTextarea from './EditableTextarea'
// import EditableCalendarInput from './EditableCalendarInput'
// import EditableFileImage from './EditableFileImage'
// import countryList from '../data/countryList'

import Document from './Document'
import Page from './Page'
import View from './View'
import { Font } from '@react-pdf/renderer'
import { ProductType } from '../data/types'

// import IteamList from '../data/ItemDetails'
// import ItemDetails from '../data/ItemDetails'

Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf' },
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf', fontWeight: 600 },
  ],
})

interface Props {
  selectedProduct?: Partial<ProductType> 
  addProduct?:any
  showProductList?:any
  updateProduct?:any
  deleteProductData?:any
  showDeletedProductList?:any
  recoverProductData?:any
}

const ProductAddForm: FC<Props> = ({ selectedProduct, addProduct, showProductList, updateProduct, deleteProductData ,showDeletedProductList, recoverProductData}) => {
  const [productData , setProductData] = useState<Partial<ProductType> >({cost:0,text:'',cost_cash:0,value:''});
  useEffect(() => {
    if (selectedProduct && selectedProduct.id) {
        setProductData(selectedProduct);
    }
  }, [selectedProduct])

  const handleChange = (nameOfField: keyof ProductType, value : string | number) =>{
      let newProductData = {...productData};
      newProductData[nameOfField] = value;
      setProductData(newProductData);
  }
  const saveProduct = () =>{
      if(productData.id){
          if(productData.cost && productData.cost_cash && productData.value){
            updateProduct({...productData,text:productData.value}).then(showProductList());
          }
          else{
            alert("Please add product name, credit cost and cash cost !!! ")
        }
      }
      else if(productData.cost && productData.cost_cash && productData.value){
        addProduct({...productData,text:productData.value},"productList").then(showProductList());
      }
      else{
          alert("Please add product name, credit cost and cash cost !!! ")
      }
     
  }

  const deleteProduct = () =>{
    if(productData.id && productData.isDeleted){
       recoverProductData({...selectedProduct}).then(showDeletedProductList());
    }
    else if(productData.id){
          deleteProductData({...selectedProduct}).then(showProductList());
    }
    else{
        alert("This Product is not yet added ")
    }
   
}

  return (
    <Document>
      <Page className="invoice-wrapper">
       <span className="material-icons" style={{cursor:'pointer'}} onClick={((selectedProduct && selectedProduct.id && !selectedProduct.isDeleted)||!selectedProduct) ?showProductList :showDeletedProductList}>
          arrow_back
        </span>
        <View className="flex" >
       
          <View className="w-50">
          <div className="w-50" style={{display:'flex',flexDirection:'row'}}>
              <EditableInput
                  value="Product Name"
              />
                <EditableInput
                  placeholder="Product Name"
                  value={productData.value}
                  onChange={(value) => handleChange('value', value)}
                />
          </div>

          <div className="w-50" style={{display:'flex',flexDirection:'row'}}>
              <EditableInput
                  value="Credit Cost"
                />
              <EditableInput
                  placeholder="Credit Cost"
                  value={productData.cost}
                  type="number"
                  onChange={(value) => handleChange('cost', value)}
                
                />
            </div>

          <div className="w-50" style={{display:'flex',flexDirection:'row'}}>
              <EditableInput
                  value="Cash Cost"
                />
              <EditableInput
                placeholder="Cash Cost"
                type="number"
                value={productData.cost_cash}
                onChange={(value) => handleChange('cost_cash', value)}
              />
            </div>
          
           
           
          </View>
          </View>
        <div style={{display:'flex',flexDirection:'row-reverse',justifyContent:'space-between'}}>
         
        {((selectedProduct && !selectedProduct.isDeleted)|| !selectedProduct) && <button className='btn' style={{background:'green',color:'white'}} onClick={saveProduct}> 
             {selectedProduct && selectedProduct.id ?'Update':'Add'} Product
          </button>
          }
          {selectedProduct && selectedProduct.id && 
          <button className='btn' style={{background:!selectedProduct.isDeleted ?'red' :'blue',color:'white',marginRight:'10px'}} onClick={deleteProduct}> 
             {!selectedProduct.isDeleted ?'Delete' :'Recover'} Product
          </button>
          }
        </div>

       
      </Page>
    </Document>
  )
}

export default ProductAddForm
