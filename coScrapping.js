
// ###################################### %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ######################################
// ******************** puppeteer is the tool which we are unsing hear for auttomation ******************** 
const puppeteer = require("puppeteer");
// ************ fs is for reading / writing file *********************
const fs = require("fs");
// ************** path is used to get path from you local system and also to make new path's ******************
const path = require("path");
// ********* xlsx module is is for Working with excel file.*********************8
const xlsx = require("xlsx");

// current time when coScrapping called. *********************
const startTime = Date.now();

// ###################### This is main function of this automation #################
function processeSingleInstagram(getUserName,getPassword,getTargetId){   
let page,browser;
// ######################################      ########################################################
// This is a async function which means we have to use await key befor any operation 
// because each line will execute seriallay that's one by one.
// *****************************          *********************************************************
    (async function fn () {
            let browserStractPromise = await puppeteer.launch({
                // By defalut headless is true but for watching the automation activity we do it false
                //  In production we make it true.
                headless :false, defaultViewport: null,
                // This start-maximize will make full screen mode , and --disable-notification will make sure that while automation if any notification by that page then this will disable automatically.
                // so that automation won't intruppt.
                args: ["--start-maximized", "--disable-notifications"]
            }) 
            browser = browserStractPromise;
            page = await browser.newPage();
        try{
            await page.goto("https://www.instagram.com/");
            await page.waitForSelector('input[aria-label="Phone number, username, or email"]',{visible : true});
            // puppeteer is not supporting page.waitFor(time in milli second) because in this many uncertinaties are their so they introduce line no. 37 for waiting.
            // i.e settimeout function will works as a barrier in between processor and next task will give time frame.
            await new Promise((resolve, reject) => setTimeout(resolve, 2000));
            // *********** Writting username as normal speed of 350ms per word, because of buy passing instagram minimum time to login policy ******
            await page.type('input[aria-label="Phone number, username, or email"]',getUserName,{delay: 350});
            await new Promise((resolve, reject) => setTimeout(resolve, 2000));
            await page.type('input[aria-label="Password"]',getPassword,{delay: 350});
            await new Promise((resolve, reject) => setTimeout(resolve, 10000));

            // This handelIfNotPresent is a custom function defined at line number 103 will ensure that is selector not found then not give error because instgram some time wont give this hurdel to some id's.
            await handelIfNotPresent('.sqdOP.L3NKy.y3zKF',page);
            await handelIfNotPresent('.cmbtv',page);
            console.log("working on this insta id --------",Date.now() - startTime);
            // ******************* Try catch function for handling error if occurs.*************
            try{
                // Itterate on Target Id 
                for(let j = 0; j < getTargetId.length; j++){
                    console.log("----------------------- Insta target Id is - ",getTargetId[j], Date.now() - startTime)
                    await new Promise((resolve, reject) => setTimeout(resolve, 5000));
                    await page.waitForSelector('input[placeholder="Search"]',{visible:true});
                    await page.type('input[placeholder="Search"]',getTargetId[j],{delay:300});
                    await new Promise((resolve, reject) => setTimeout(resolve, 3000));
                    await page.keyboard.press('ArrowDown',{ delay: 100 });
                    await page.keyboard.press('Enter');
                    // Now automation is at the target id's page last recent post.
                    try{
                        // ##########################################################################################
                        // ******** waitTillHTMLRendered is a custom function for checking the page is fully loadded or not.**********
                        await waitTillHTMLRendered(page);
                        let fstElem = await page.$$('div[class="v1Nh3 kIKUG  _bz0w"]');
                        await fstElem[0].click({delay : 300});
                        await handelIfNotPresent('svg[aria-label="More options"]',page);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const fstPost = await page.$$('.aOOlW.HoLwm');
                        await fstPost[0].click({delay : 200});
                        await waitTillHTMLRendered(page);
                        let totElem = await page.$$('div[class="v1Nh3 kIKUG  _bz0w"]');
                        // *********** totElem means that the number of post targer user on the last recent post ..... it is fixed if post greater
                        // then 6 else work on the number of post. 
                        for(let i = 0; i < totElem.length; i++){
                            // ********************** calling function asyncFnForScraping 
                            await asyncFnForScraping(page,i);
                        }
                    }catch(err){
                        console.log("This id don't have any post yet!!!!!!!",Date.now() - startTime);
                    }
                }
            }catch(err){
                console.log("Error in scrapping because target id wont matched !!!!!!!",Date.now() - startTime);
            }
            console.log("Scrapping is done ----- Now the time is to log out",Date.now() - startTime);
            // ************** This is also a custom async function, called when all scapping is dont then logout that id.***************
            await customPromiseHandleLogOut('.XrOey',page);
            await new Promise(resolve => setTimeout(resolve, 10000));
            // ***********After logout it will wait for next 10 second and then close the browser.
            await browser.close();
            // ###################### This is Indication for completing of function.
            return 1;
        }catch (err){
            console.log(err);
        }
    })();

}

//@@@@@@@@@@@@@@@@@ This is a custom promisified function takes selector and then wait for 
// that selector after this click on that selector element.@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    function myWaitAndClick(selector, cPage){
    return new Promise ( function (resole, reject){
        let waitForModalPromise = cPage.waitForSelector(selector,{visible:true});
        waitForModalPromise.then(function (){
            let clickModal = cPage.click(selector,{delay:100});
            return clickModal;
        }).then(function(){
            resole();
        }).catch(function(){
            reject();
        })
    })
    };

// ######################## This is a custom promise takes selector and then call myWitAndClick 
// promise after if it gives error then also this function wont give error.###################
    function handelIfNotPresent(selector,cPage){
    return new Promise(function (resolve, reject){
        // wait click modal
        let waitAndClickPromise = myWaitAndClick(selector,cPage);
        waitAndClickPromise.then(function(){
            resolve();
        }).catch(function(err){
            resolve();
        })
    })
    };
// ###########################custom promisified function for logout ############################
    async function customPromiseHandleLogOut(selector,cPage){
        await cPage.waitForSelector(selector,{visible : true});
        let allElem = await cPage.$$(selector);
        console.log("Logout options--",Date.now() - startTime);
        if(allElem.length == 6){
            await allElem[5].click({ delay: 100});
        }else{
            await allElem[4].click({ delay: 100});
        }
        console.log("Selecting Select logout button selector",Date.now() - startTime);
        await cPage.waitForSelector('div[style="height: 28px; width: 170px;"]',{visible:true});
        console.log("waiting for logout button",Date.now() - startTime);
        let allLisPromise2 = await cPage.$$('div[style="height: 28px; width: 170px;"]');
        console.log("Logout options clicked",Date.now() - startTime);
        await allLisPromise2[4].click({ delay: 100});
        console.log("Successfully clicked on logout button",Date.now() - startTime);
    }

    // ****************************** Custom Promise function for scraapping of comments from that page.
    async function asyncFnForScraping(page,postNo) {
    console.log("Async Function For scrapping starting",Date.now() - startTime);
    if(postNo != 0){
        const fstElem = await page.$$('div[class="v1Nh3 kIKUG  _bz0w"]');
        await fstElem[postNo].click({delay : 300});
    }
        await waitTillHTMLRendered(page);
        const fstDesc = await page.$$('.C4VMK>span');
        var desc = await page.evaluate(el => el .textContent, fstDesc[0]);
        console.log("----------------Description is :- ",desc,Date.now() - startTime);
        const fstDate = await page.$('._1o9PC.Nzb55');
        var dateOfUpload = await page.evaluate(el => el .textContent, fstDate);
        console.log("Date of upload :- ",dateOfUpload,Date.now() - startTime);
        let noOfLikesOrViews = 0;
        try{
            var fstNoViewsOrLikes = await page.$$('.zV_Nj>span');
            noOfLikesOrViews = await page.evaluate(el => el .textContent, fstNoViewsOrLikes[0]);
        }catch{
            try{
                var fstNoViewsOrLikes = await page.$$('.vcOH2>span');
                noOfLikesOrViews = await page.evaluate(el => el .textContent, fstNoViewsOrLikes[0]);
            }catch(err){
                console.log("Likes & Views may be zero",Date.now() - startTime);
            }
        }
        console.log("Total numbers of like / view of this post is - ",noOfLikesOrViews,Date.now() - startTime);
        try{
            // ############## One click load 12 comments to this will trigger 20 times to get at least 240 + 12 = 252 comments
            // ############# Some times instagram make this buttom disable.

            // const loopCount = Math.floor(noOfLikesOrViews / 10000);
            const loopCount = 5;
            await new Promise(resolve => setTimeout(resolve, 5000));
            for(let i = 0; i < loopCount; i++){
                await page.click('.glyphsSpriteCircle_add__outline__24__grey_9.u-__7');
                await waitTillHTMLRendered(page);
                console.log("comments loading",i,Date.now() - startTime);
            }
        }catch(err){
            console.log("------------------------>This is last Comment OR button not found",Date.now() - startTime);
        }

        // **************** Scroll the comment at last so that all the comment woud appear.*********************
        let commentElemList = await page.$$('.C4VMK>span');
        let lastComment = commentElemList[commentElemList.length - 1];
        await page.evaluate(function (elem){
            elem.scrollIntoView();
        },lastComment);
        
        let nameList = await page.$$('.ZIAjV');
        let postUserName = await page.evaluate(el => el .textContent, nameList[0]);
        let commArray = [];
        commArray.push({totalLikesViews : noOfLikesOrViews, Date_OF_upload : dateOfUpload});
        // ************************ Pushing data into array list********************************************
        for(let i = 1; i < nameList.length - 1; i++){
            let nameNcommList = await page.evaluate(getNameAndComment,nameList[i],commentElemList[i - 1]);
            commArray.push(nameNcommList);
        }
        console.table(commArray);
        console.log("Writting data into excel file",Date.now() - startTime);
        try{
            // ****************** Calling for writting comments into Excel file.********************
            processExcelfile(postUserName,dateOfUpload,commArray);
            console.log("Writted data into excel file",Date.now() - startTime);
        }catch{
            console.log("Error in writting excel file --------------------------",Date.now() - startTime)
        }
        return commArray;
    };

// function to return a arraylist.
    function getNameAndComment(element1, element2) {
    return {
        name: element1.textContent.trim(),
        comment: element2.textContent.trim()
    }
    };

// ################################## This is use to check the page is fully loaded or not if not then wait for 10 time hits each of 1 seconds.########################
    const waitTillHTMLRendered = async (page, timeout = 10000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while (checkCounts++ <= maxChecks) {
        let html = await page.content();
        let currentHTMLSize = html.length;

        let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

        console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0; //reset the counter

        if (countStableSizeIterations >= minStableSizeIterations) {
            console.log("Page rendered fully..",Date.now() - startTime);
            break;
        }

        lastHTMLSize = currentHTMLSize;
        await new Promise(resolve => setTimeout(resolve, checkDurationMsecs));
    }
    };

//  processExcelFile excelwritter and excel reader function will read excel file is not present then create new file and write the comment and make a seperate database.
    function processExcelfile(userName, dateOfupload, finalArrayList){
        console.log("process excel file function writting data in excel",Date.now() - startTime)
        let dataPath = path.join(__dirname, userName);
        dirCreater(dataPath);
        let filePath = path.join(dataPath, dateOfupload + ".xlsx");
        let content = excelReader(filePath,dateOfupload);
        for(var i = 0; i < finalArrayList.length; i++){
            content.push(finalArrayList[i]);
        }
        excelWritter(filePath,content,dateOfupload);
    }
    function dirCreater(filePath){
        if(fs.existsSync(filePath) == false){
            fs.mkdirSync(filePath);
        }
    }
    function excelWritter(filePath, json,sheetName){
        let newWB = xlsx.utils.book_new();
        let newWS = xlsx.utils.json_to_sheet(json);
        xlsx.utils.book_append_sheet(newWB, newWS,sheetName);
        xlsx.writeFile(newWB, filePath);
    }
    function excelReader(filePath,sheetName){
        if(fs.existsSync(filePath) == false){
            return [];
        }
        let wb = xlsx.readFile(filePath);
        let excelData = wb.Sheets[sheetName];
        let ans  = xlsx.utils.sheet_to_json(excelData);
        return ans;
    }

// This will allow processeSinghInstagram function to execute from outside this file.
module.exports = {
    isf: processeSingleInstagram
}