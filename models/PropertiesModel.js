const sql = require("../config/db_connection.js");
const moment = require('moment-timezone');
const tzone = "America/Los_Angeles";
var slug = require('slug')

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
                        country: currentObj[i].field_Country,
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
                        bathroomsTotal: currentObj[i].field_BathroomsTotalInteger,
                        bedroomsTotal: currentObj[i].field_BedroomsTotal,
                        roomsTotal: currentObj[i].field_RoomsTotal,
                        areaTotal: currentObj[i].field_AreaTotal,
                        slug: slug(currentObj[i].field_FullStreetAddress+"-"+currentObj[i].id),
                        mlsListDate:moment(currentObj[i].field_MLSListDate).tz(tzone).format('YYYY-MM-DD'),
                        listingAgreementType: currentObj[i].field_ListingAgreementType,
                        listingServiceType: currentObj[i].field_ListingServiceType,
                        listingSourceBusinessPartner: currentObj[i].field_ListingSourceBusinessPartner,
                        totalPublicOpenHouses: currentObj[i].field_TotalPublicOpenHouses,
                        totalVirtualTours: currentObj[i].field_totalVirtualTours,
                        publicRemarks: currentObj[i].field_PublicRemarks,
                        daysOnMarket: currentObj[i].field_DaysOnMarket,
                        mlsListDate: currentObj[i].field_MLSListDate,
                        priceChangeTimestamp: currentObj[i].field_PriceChangeTimestamp,
                        onMarketDate: currentObj[i].field_OnMarketDate,
                        associationAmenities: currentObj[i].field_AssociationAmenities,
                        incorporatedCityName: currentObj[i].field_IncorporatedCityName,
                        streetNumber: currentObj[i].field_StreetNumber,
                        postalCode: currentObj[i].field_PostalCode,
                        stateOrProvince: currentObj[i].field_StateOrProvince,
                        streetName: currentObj[i].field_StreetName,
                        unparsedAddress: currentObj[i].field_UnparsedAddress,
                        fullStreetAddress: currentObj[i].field_FullStreetAddress,
                        listingLocale: currentObj[i].field_ListingLocale,
                        mlsAreaMajor: currentObj[i].field_MLSAreaMajor,
                        directions: currentObj[i].field_Directions,
                        listAgentMlsId: currentObj[i].field_ListAgentMlsId,
                        listAgentEmail: currentObj[i].field_ListAgentEmail,
                        listAgentFullName: currentObj[i].field_ListAgentFullName,
                        listAgentKey: currentObj[i].field_ListAgentKey,
                        listAgentPreferredPhone: currentObj[i].field_ListAgentPreferredPhone,
                        listAgentStateLicenseNumber: currentObj[i].field_ListAgentStateLicenseNumber,
                        elementarySchool: currentObj[i].field_ElementarySchool,
                        schoolDistrictName: currentObj[i].field_SchoolDistrictName,
                        syndicateToOption: currentObj[i].field_SyndicateToOption,
                        virtualTourURLUnbranded: currentObj[i].field_VirtualTourURLUnbranded,
                        aboveGradeFinishedArea: currentObj[i].field_AboveGradeFinishedArea,
                        aboveGradeFinishedAreaUnits: currentObj[i].field_AboveGradeFinishedAreaUnits,
                        belowGradeFinishedArea: currentObj[i].field_BelowGradeFinishedArea,
                        belowGradeFinishedAreaUnits: currentObj[i].field_BelowGradeFinishedAreaUnits,
                        basement: currentObj[i].field_Basement,
                        builderName: currentObj[i].field_BuilderName,
                        cooling: currentObj[i].field_Cooling,
                        exteriorFeatures: currentObj[i].field_ExteriorFeatures,
                        flooring: currentObj[i].field_Flooring,
                        accessibilityFeatures: currentObj[i].field_AccessibilityFeatures,
                        garageYN: currentObj[i].field_GarageYN,
                        heating: currentObj[i].field_Heating,
                        heatingYN: currentObj[i].field_HeatingYN,
                        interiorFeatures: currentObj[i].field_InteriorFeatures,
                        livingArea: currentObj[i].field_LivingArea,
                        livingAreaUnits: currentObj[i].field_LivingAreaUnits,
                        openParkingSpaces: currentObj[i].field_OpenParkingSpaces,
                        parkingFeatures: currentObj[i].field_ParkingFeatures,
                        propertyCondition: currentObj[i].field_PropertyCondition,
                        parkingTypes: currentObj[i].field_ParkingTypes,
                        garageTYpe: currentObj[i].field_GarageTYpe,
                        totalGarageAndParkingSpaces: currentObj[i].field_TotalGarageAndParkingSpaces,
                        zoning: currentObj[i].field_Zoning,
                        saleType: currentObj[i].field_SaleType,
                        pool: currentObj[i].field_Pool,
                        propertyType: currentObj[i].field_PropertyType,
                        waterfrontYN: currentObj[i].field_WaterfrontYN,
                        appliances: currentObj[i].field_Appliances,
                        listPictureURL: currentObj[i].field_ListPictureURL,
                        listPicture2URL: currentObj[i].field_ListPicture2URL,
                        listPicture3URL: currentObj[i].field_ListPicture3URL,
                        images: currentObj[i].Images,
                        pricePerSquareFoot: currentObj[i].field_PricePerSquareFoot
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


subQuery = "SELECT rd.id,field_ListingId,(SELECT GROUP_CONCAT(DISTINCT Image) FROM `rc_images` AS ri WHERE rd.field_ListAgentKey = ri.MLS_ID) AS Images,field_ListingAgreementType, field_ListingServiceType,field_ListingSourceBusinessPartner,field_TotalPublicOpenHouses,field_totalVirtualTours,field_PublicRemarks, field_MlsStatus,field_ClosePrice,field_ListPrice,field_OriginalListPrice,field_DaysOnMarket,field_MLSListDate,field_PriceChangeTimestamp, field_OnMarketDate,field_AssociationAmenities,field_City,field_Country,field_County, field_IncorporatedCityName, field_StreetNumber,field_PostalCode, field_StateOrProvince, field_StreetName,field_UnparsedAddress,field_FullStreetAddress,field_ListingLocale,field_MLSAreaMajor,field_Directions,field_Latitude,field_Longitude,field_ListAgentMlsId,field_ListAgentEmail,field_ListAgentFullName,field_ListAgentKey,field_ListAgentPreferredPhone,field_ListAgentStateLicenseNumber,field_ElementarySchool,field_SchoolDistrictName,field_SyndicateToOption,field_VirtualTourURLUnbranded,field_AboveGradeFinishedArea,field_AboveGradeFinishedAreaUnits,field_BelowGradeFinishedArea,field_BelowGradeFinishedAreaUnits,field_Basement,field_BuilderName,field_Cooling,field_ExteriorFeatures, field_Flooring,field_AccessibilityFeatures,field_GarageYN,field_Heating,field_HeatingYN,field_InteriorFeatures,field_LivingArea, field_LivingAreaUnits,field_OpenParkingSpaces,field_ParkingFeatures, field_PropertyCondition,field_ParkingTypes,field_GarageTYpe,field_TotalGarageAndParkingSpaces,field_AreaTotal,field_Zoning,field_SaleType,field_Pool,field_PropertyType,field_WaterfrontYN,field_Appliances,field_BathroomsTotalInteger,field_BathroomsFull,field_BathroomsHalf,field_BedroomsTotal,field_ListPicture2URL,field_ListPicture3URL,field_ListPictureURL,field_RoomsTotal,field_PricePerSquareFoot FROM rc_data AS rd WHERE 1=1 "+cond+" ORDER BY rd.id DESC";

sqlQuery = subQuery+" "+limit;

//console.log(sqlQuery);
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