var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var ddb = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();

var params = { Bucket: "sa-launch-rockingdeeplambda"};
 

exports.handler = async function (event, context) { 
  try {
    const newParams = {...params, Key: event["key1"]};
    const data = await s3.getObject(newParams).promise();
    
    const jsonData = JSON.parse(data.Body.toString());
    
    const dbParams = { TableName: "customers-master" };
    let successfulItems = 0;
    for (var i = 0; i < jsonData.length; i++) {
      let item = jsonData[i];
      try{
        const currDbParams = { ...dbParams, 
        Item: {
          'id' : item["customerId"].toString(),
          'datetime': item["date"],
          'customerName': item['customerName'],
          ...item
        }
      };
       
      await ddb.put(currDbParams).promise();
      successfulItems++;
      
      }
      catch(err) {
        console.error(err);
        
      }
    }
   
    return data;
  }
  catch (err){
    console.error(err)
  }
  
};
