
// ################# This module is used for getting data from command line as seen in line no 7 ###################
const { exit } = require("process");
const instaScript = require("./coScrapping.js");
const inputArr = process.argv.slice(2);

let arr = [];
// *****files path , options diffrentiate *******************.
if(inputArr.length == 3){
    userName = inputArr[0];
    password = inputArr[1];
    target = inputArr[2];
    arr.push(target);
    exp(userName,password,arr)

    //  ******* Reading two paths 1st for userId, password another for targer ID's ******************.
}else if (inputArr.length == 2){
  var idPassAddr = inputArr[0];
  var targetIdaddr = inputArr[1];
  // ***************** This is Node module for working in excel file ******************.
  var XLSX = require('xlsx')
// *************** readFile will read file then read that sheet which is at 1st called as workbook ********
  var workbook = XLSX.readFile(idPassAddr);
  var sheet_name_list = workbook.SheetNames;
  var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  
  // same as above 
  var workbook2 = XLSX.readFile(targetIdaddr);
  var sheet_name_list_2 = workbook2.SheetNames;
  var xlTargetAll = XLSX.utils.sheet_to_json(workbook2.Sheets[sheet_name_list_2[0]]);

  // ********************* This loop is for wrapping of all Target id into arr.
  for(let j = 0; j < xlTargetAll.length; j++){
    arr.push(xlTargetAll[j].targetName);
  }                              
    // ***************************************** %%%%%%%%%%%%%%%  ********************************************************
    // This will read from excel file and index 0 is for 1st id.
    // if you have multiple id's in excel file then this will help you to take that ID & password by just entering index number into it.
    // default it will be at 0
    userName = xlData[12].userName;
    password = xlData[12].password;
    target = xlTargetAll;

    // Initilizing the exp funtion with three parementers 
    exp(userName,password,arr); 
}

// ***************************** If you user entered wrong length of input **************************************.
else{
  console.log("You have entered wrong commad !! please check and redo.");
}

// This will call coSracpping.js file with three parameters User name, Password & Target ID.
function exp(userName,password,target){
    instaScript.isf(userName,password,target);
    console.log(`name ${userName} password ${password} and target ${target}`);
}