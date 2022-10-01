export const capitalizeWords = (value: string) => {
  return value.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
};



export const setItemListToLocalStorage = (itemName:string, value:any) => {
  localStorage.setItem(itemName,JSON.stringify(value));
}

export const getItemListFromLocalStorage = (itemName:string) =>{
  return JSON.parse(localStorage.getItem(itemName)??'[]');
}

export const sortListDescending = (list:[],property?:string)=> {
  let sortedList = [];
  try{
   sortedList= list.sort((obj1: any, obj2: any) => {
     if (property && obj1[property] && obj2[property]) {
       return obj2[property] - obj1[property];
     } else if (obj1.createdDate && obj2.createdDate) {
       return obj2.createdDate - obj1.createdDate;
     } else {
       let valueA = obj1 && obj1.invoiceDate;
       let valueB = obj2 && obj2.invoiceDate;
       if (!valueA) {
         return 1;
       } else if (!valueB) {
         return -1;
       }
       const cellDateA = new Date(valueA);
       const cellDateB = new Date(valueB);
       if (cellDateA == cellDateB) return 0;
       return cellDateA > cellDateB ? -1 : 1;
     }
   });}
  catch(e){
    sortedList = list;
    console.log("Error occured by sorting list");
  }
  return sortedList;
}

const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

export const  formatDate = (inputDate:any) => {

  let date, month, year;

  date = inputDate.getDate();
  month = inputDate.getMonth() ;
  year = inputDate.getFullYear();

    date = date
        .toString()
        .padStart(2, '0');

    // month = month
    //     .toString()
    //     .padStart(2, '0');

  return `${date}-${monthNames[month]}-${year}`;
}

export const displayDate = (object:any)=>{
  let date = '';
  try{
    if(typeof (object.createdDate) === 'number'){
      return formatDate(new Date(object.createdDate));
    }
    else if( object.createdDate.seconds){
      return formatDate(new Date(object.createdDate.seconds));
    }
  }
  catch(e){
    console.log('Unable to format date',e);
  }
  return date;
}

export const displayCurrency =(num:any,inWords?:boolean)=>{
  let n1, n2;
  num = num + "" || "";
  n1 = num.split(".");
  n2 = n1[1] || null;
  n1 = n1[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
  num = n2 ? n1 + "." + n2 : n1;
  return (inWords?'':'₹')+num;
}

export const printPDF = (blobURL:any) => {
  // var blob = new Blob([req.response], {type: 'application/pdf'}); //this make the magic
  // var blobURL = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe"); //load content in an iframe to print later
  document.body.appendChild(iframe);

  iframe.style.display = "none";
  iframe.src = blobURL;
  console.log("ifarme", iframe);
  iframe.onload = function () {
    setTimeout(function () {
      
      if (iframe!=null) {
        iframe?.focus();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
         iframe.contentWindow?.print();
      }
    }, 1);
  };
};

export const getMessage = (amount: string) => {
  return `प्रिय ग्राहक, %0a
कृपया कर आप का बकाया राशि का भुगतान कर %0a
राशि :- ${amount}%0a
ॐ साई कृषि सेवा केंद्र%0a
दीपक पटेल%0a`;
};

export const getWhatsAppUrl = (phoneNumber: string, message: string) => {
  //return `https://api.whatsapp.com/send?phone=91${phoneNumber}&text=${message}`;
 return `https://web.whatsapp.com/send?phone=91${phoneNumber}&amp&text=${message}`;
// return "https://wa.me/08231231412?text=Halo%20name%20maya%20nadine";
//return 'https://web.whatsapp.com/send?phone=918103485695&text=%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%BF%E0%A4%AF+%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%B9%E0%A4%95%252C%0A%E0%A4%86%E0%A4%AA%E0%A4%A8%E0%A5%87+23-Sept-2022+%E0%A4%95%E0%A5%8B+%E2%82%B9110+%E0%A4%B0%E0%A5%81%E0%A4%AA%E0%A4%AF%E0%A5%87+%E0%A4%95%E0%A4%BE+%E0%A4%AD%E0%A5%81%E0%A4%97%E0%A4%A4%E0%A4%BE%E0%A4%A8+%E0%A4%95%E0%A4%BF%E0%A4%AF%E0%A4%BE+%E0%A4%B9%E0%A5%88%E0%A5%A4%0A%E0%A4%85%E0%A4%AC+%E0%A4%86%E0%A4%AA%E0%A4%95%E0%A5%80+%E0%A4%95%E0%A5%81%E0%A4%B2+%E0%A4%AC%E0%A4%95%E0%A4%BE%E0%A4%AF%E0%A4%BE+%E0%A4%B0%E0%A4%BE%E0%A4%B6%E0%A4%BF+%E2%82%B9890+%E0%A4%B0%E0%A5%81%E0%A4%AA%E0%A4%AF%E0%A5%87+%E0%A4%B9%E0%A5%88%E0%A5%A4%0A%E0%A4%A7%E0%A4%A8%E0%A5%8D%E0%A4%AF%E0%A4%B5%E0%A4%BE%E0%A4%A6%252C%0A%E0%A4%A6%E0%A5%80%E0%A4%AA%E0%A4%95+%E0%A4%AA%E0%A4%9F%E0%A5%87%E0%A4%B2'
};

export const getWhatsApiAppUrl = (phoneNumber: string, message: string) => {
  return `https://api.whatsapp.com/send?phone=91${phoneNumber}&text=${message}`;
  //return `https://web.whatsapp.com/send?phone=91${phoneNumber}&amp;text=${message}`;
  // return "https://wa.me/08231231412?text=Halo%20name%20maya%20nadine";
  //return 'https://web.whatsapp.com/send?phone=918103485695&text=%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%BF%E0%A4%AF+%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%B9%E0%A4%95%252C%0A%E0%A4%86%E0%A4%AA%E0%A4%A8%E0%A5%87+23-Sept-2022+%E0%A4%95%E0%A5%8B+%E2%82%B9110+%E0%A4%B0%E0%A5%81%E0%A4%AA%E0%A4%AF%E0%A5%87+%E0%A4%95%E0%A4%BE+%E0%A4%AD%E0%A5%81%E0%A4%97%E0%A4%A4%E0%A4%BE%E0%A4%A8+%E0%A4%95%E0%A4%BF%E0%A4%AF%E0%A4%BE+%E0%A4%B9%E0%A5%88%E0%A5%A4%0A%E0%A4%85%E0%A4%AC+%E0%A4%86%E0%A4%AA%E0%A4%95%E0%A5%80+%E0%A4%95%E0%A5%81%E0%A4%B2+%E0%A4%AC%E0%A4%95%E0%A4%BE%E0%A4%AF%E0%A4%BE+%E0%A4%B0%E0%A4%BE%E0%A4%B6%E0%A4%BF+%E2%82%B9890+%E0%A4%B0%E0%A5%81%E0%A4%AA%E0%A4%AF%E0%A5%87+%E0%A4%B9%E0%A5%88%E0%A5%A4%0A%E0%A4%A7%E0%A4%A8%E0%A5%8D%E0%A4%AF%E0%A4%B5%E0%A4%BE%E0%A4%A6%252C%0A%E0%A4%A6%E0%A5%80%E0%A4%AA%E0%A4%95+%E0%A4%AA%E0%A4%9F%E0%A5%87%E0%A4%B2'
};

export const getDepositedMessage = (amount: string, dueAmount: string) => {
return `प्रिय+ग्राहक\nआपने+${displayDate({
  createdDate: new Date().getTime(),
})}+को+${amount}+रुपये+का+भुगतान+किया+है।\nअब+आपकी+कुल+बकाया+राशि+${dueAmount}+रुपये+है।\nधन्यवाद\nदीपक+पटेल`;
};

