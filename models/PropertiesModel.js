const sql = require("../config/db_connection.js");
const moment = require('moment-timezone');
const tzone = "Asia/Kolkata";

// constructor
const Properties = function(user) {
  
};

//Update Properties object 
Properties.updatePropertiesObj = (currentObj,PropertiesCallBackFun) => {
  //console.log(currentObj);
  var promises = [];
  for (let i=0;i<currentObj.length;i++) {

     promises.push({
                        id:currentObj[i].id,
                        listingId: currentObj[i].field_ListingId,
                        description: currentObj[i].field_PublicRemarks,
                        mlsStatus: currentObj[i].field_MlsStatus,
                        //closePrice: currentObj[i].field_ClosePrice,
                        listPrice: currentObj[i].field_ListPrice,
                        originalListPrice: currentObj[i].field_OriginalListPrice,
                        county: currentObj[i].field_County,
                        city: currentObj[i].field_City,
                        fullStreetAddress: currentObj[i].field_FullStreetAddress,
                        _geoloc: {
                            lat: currentObj[i].field_Latitude,
                            lng: currentObj[i].field_Longitude,
                        },
                        geography: {
                            lat: currentObj[i].field_Latitude,
                            lng: currentObj[i].field_Longitude,
                        },
                        listingLocale: currentObj[i].field_ListingLocale,
                        mapURL: currentObj[i].field_MapURL,
                        bathroomsTotal: currentObj[i].field_BathroomsTotalInteger,
                        bedroomsTotal: currentObj[i].field_BedroomsTotal,
                        netSquareFeet: currentObj[i].field_NetSquareFeet,
                        load: currentObj[i].field_Load,
                        listAgentEmail: currentObj[i].field_ListAgentEmail,
                        coverImage: currentObj[i].field_ListPictureURL,
                        images: [],
                        //created:moment(currentObj[i].created_at).tz(tzone).format('YYYY-MM-DD HH:mm:ss'),
                    });
  }
  Promise.all(promises)
    .then(() => {
      //console.log(promises);
      PropertiesCallBackFun(promises);
    })
    .catch((e) => {
        // handle errors here
        console.log(e);
    });
};

//get properties
Properties.getProperties = (params, page, numPerPage, result) => {

let skip = (page-1) * numPerPage;
let limit = "  LIMIT  "+skip + ',' + numPerPage;

let sqlQuery ='';
let subQuery ='';
let cond='';


if(params.type && params.type != 'all')
cond = " AND field_County = '"+params.type+"'";

search_key = params.search_key && params.search_key.replace(/\+/g, " ");
if(search_key)
cond += " AND ((LOWER(field_County)) REGEXP '(^|[[:space:]])" +search_key.toLowerCase()+ "([[:space:]]|$)')";


subQuery = "SELECT rd.id,field_ListingId,field_CoListAgentKey,ri.id AS imgId,ri.Image,field_PublicRemarks, field_MlsStatus,field_ClosePrice,field_ListPrice,field_OriginalListPrice,field_County,field_City, field_FullStreetAddress,field_ListingLocale,field_Latitude,field_Longitude,field_MapURL,field_BathroomsTotalInteger,field_BathroomsFull,field_BathroomsHalf,field_BedroomsTotal,field_NetSquareFeet,field_Load,field_ListAgentEmail,field_ListPictureURL FROM rc_data AS rd LEFT JOIN `rc_images` AS ri ON rd.field_CoListAgentKey = ri.MLS_ID WHERE 1=1 "+cond+" ORDER BY rd.id DESC";

sqlQuery = subQuery+" "+limit;

console.log(sqlQuery);
sql.query("SELECT count(*) as numRows FROM ("+subQuery+")t",async function (err, rows)  {
    if (err) {
      result(err, null);
      return;
    }
    if (await rows.length && rows[0].numRows>0) {
        var numRows = rows[0].numRows;
        var numPages = Math.ceil(numRows / numPerPage);
        sql.query(sqlQuery, async function (err, res)  {
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }else{
                 if ((page-1) < numPages) {
                    pagination = {
                      total:numRows,
                      current: page,
                      perPage: numPerPage,
                      previous: page > 1 ? page - 1 : undefined,
                      next: (page-1) < numPages - 1 ? page + 1 : undefined
                    }
                  }
                  else {
                    pagination = {
                    err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
                  }
                }
                result(null, {list: await res, pagination: pagination});
                return;
            }
        });     
    }
    else{
          // not found with the id
          result(null, { kind: "not_found" });
          return;
    }

  });
};

module.exports = Properties;