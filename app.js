const express 	= require('express'),
	bodyParser 	= require('body-parser'),
	cors 		= require('cors'),
	mysql		= require('mysql'),
  request = require('request'),
  moment  = require('moment'),
	app 		= express();

const server_port = process.env.PORT || this.SERVER_PORT || 1000;
const env = process.env.NODE_ENV || 'development';

var site_data,
    last_message,
    campaign_files,
    aircast_campaign,
    rpi_campaign,
    rpi_campaign_complete,
    rpi_location,
    template_list;

var aircast_portrait = [3,60,61];
var aircast_portrait_template = ['temp17','temp18','temp19','temp20','temp22','temp23','temp24','temp25'];

var connection = mysql.createConnection({
  host     : 'maindb.com4k2xtorpw.ap-southeast-1.rds.amazonaws.com',
  user     : 'Gameplandigital',
  password : 'Gameplan01',
  database : 'gp_digital',
  multipleStatements: true
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});


function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


app.set('view engine', 'ejs');

app.set('views',__dirname+'/src/views');
app.use(express.static(__dirname+'/src/static'));
// app.use('/css', express.static(__dirname + '/src/static/css'));
// app.use('/js', express.static(__dirname + '/src/static/js'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});

app.get("/", (req,res) => {
	res.render('index');
});

app.get("/textblast-per-site",(req,res) => {

     connection.query("SELECT Room,MobileNumber,ContactPersonName FROM AircastRpiLocation WHERE MobileNumber != 0", function(error,results,fields){
        site_data = results;
        res.render("send-message-item",{site_data});  
      });
        

});

app.route("/textblast")
   .get((req,res) => {

   		connection.query("SELECT Room,MobileNumber,ContactPersonName FROM AircastRpiLocation WHERE MobileNumber != 0", function(error,results,fields){
  			site_data = results;
        connection.query("SELECT message,created_at FROM aircast_notification_blast ORDER BY id DESC LIMIT 1",function(error2,results2,fields2){
          last_message = results2[0];
          res.render("send-message",{results:site_data,message_data:last_message});  
        });
  			
		});
   })
   .post((req,res) => {
      let message = req.body.message;
      var date_sent = moment().format('ddd, MMM DD, YYYY | hh:mm a');
      last_message.message = message;
      last_message.created_at = date_sent;
        
      request('http://ec2-54-169-234-246.ap-southeast-1.compute.amazonaws.com/api/v0/send-message-blast.php?message='+message,function(error,response,body){
          res.render("send-message",{results:site_data,success:"success",message_data:last_message});
      })
   });


app.route('/feedback')
   .get((req,res)=>{
      res.render('feedback-form');
   })
   .post((req,res)=>{

   })

app.route('/templates-manager')
  .get((req,res) =>{

        connection.query("SELECT * FROM AircastRpiLocation; SELECT * FROM AircastRpiCampaign WHERE (Template != 'temp2' and Template !='temp4' and Template !='temp1'); SELECT * FROM AircastCampaignFiles",function(error,results,body){
          rpi_location = results[0];
          rpi_campaign = results[1];
          campaign_files = results[2];
          res.render('templates-manager',{rpi_location,moment:moment});
        }) //end of 1nd query
            
  })

app.route("/templates-manager/:id")
  .get((req,res)=>{
      let RpiID =  req.params.id;

      
      if (rpi_location && rpi_campaign && campaign_files) {
        res.render('templates-item',{ID:RpiID,rpi_location,rpi_campaign,campaign_files,moment});
      }else {
          connection.query("SELECT * FROM AircastRpiLocation; SELECT * FROM AircastRpiCampaign WHERE (Template != 'temp2' and Template !='temp4' and Template !='temp1'); SELECT * FROM AircastCampaignFiles",function(error,results,body){
            rpi_location = results[0];
            rpi_campaign = results[1];
            campaign_files = results[2];
            res.render('templates-item',{ID:RpiID,rpi_location,rpi_campaign,campaign_files,moment});
          }) //end of 1nd query

      }
      
      // res.render()
  })

app.route("/update-campaign/:id/:param")
   .post((req,res) => {
      let id = req.params.id;
      let new_param = req.params.param;

      connection.query("UPDATE AircastCampaignFiles SET FileName = ? WHERE CampaignID = ?",[new_param,id],function(error,results,body){
        console.log(results);
        if (error) throw error;
        if (results){
          res.send({success: true});  
        }else {
          res.send({success: false});
        }
      });

   })

app.route("/toggle-campaign/:rpiid/:campaign_id/:status")
   .post((req,res) => {
      let status = req.params.status;
      let campaign_id = req.params.campaign_id;
      let rpi_id = req.params.rpiid;

      let query = 'UPDATE AircastRpiCampaign SET isEnabled = '+status+' WHERE CampaignID = '+campaign_id+' and RpiID = '+rpi_id;
      console.log(query);

      connection.query(query,function(error,results,body){
        if (error) throw error;
        if (results){
          res.send({success: true});  
        }else {
          res.send({success: false});
        }
      });
   })

app.route('/delete-campaign/:rpiid/:campaign_id')
   .post((req,res) => {
      let campaign_id = req.params.campaign_id;
      let rpi_id = req.params.rpiid;

      connection.query("DELETE FROM AircastRpiCampaign WHERE RpiID = ? and CampaignID = ?",[rpi_id,campaign_id],(error,results,body) => {
        if (error) throw error;
        if (results){
          res.send({success: true});  
        }else {
          res.send({success: false});
        }
        
      });
   })

app.get('/add-template-one/:id/:campaign/:template/:status',function(req,res){
  let rpi_id = req.params.id;
  let campaign_id = req.params.campaign;
  let template_name = req.params.template;
  let status = req.params.status;


  connection.query("INSERT INTO AircastRpiCampaign (RpiID, CampaignID, Template, isReady, isEnabled, isPriority) VALUES (?,?,?,?,?,?)",[rpi_id,campaign_id,template_name,1,status,1],(error,results,body) => {
        if (error) throw error;
        if (results){
          res.send({success: true});  
        }else {
          res.send({success: false});
        }
        
  });
})

app.get('/add-template-all/:campaign_id/:temp_name/:status',(req,res) => {

  let campaign_id  = req.params.campaign_id;
  let temp_name = req.params.temp_name;
  let status = (req.params.status == 'true');
  let all_aircast_sites, all_rpi_campaign;
  let id_to_add_template = [];
  let orientation;

  console.log(typeof status);

  if (aircast_portrait_template.indexOf(temp_name) != -1) {
    orientation = 'portrait';
  }else {
    orientation = 'landscape';
  }


  connection.query("SELECT * FROM AircastRpiLocation; SELECT * FROM AircastRpiCampaign", function(error,results,body) {

    all_aircast_sites = results[0];
    all_rpi_campaign = results[1];

        all_aircast_sites.forEach(function(item){
          let hasTemplate = false;
          let tv_orientation;

          if (aircast_portrait.indexOf(item.RpiID) != -1) {
            tv_orientation = 'portrait';
          }else {
            tv_orientation = 'landscape';
          }

          for (var i = 0; i < all_rpi_campaign.length; i++) {
            if (item.RpiID == all_rpi_campaign[i].RpiID &&  all_rpi_campaign[i].Template  == temp_name && campaign_id == all_rpi_campaign[i].CampaignID) {
              hasTemplate = true;
              break;
            }
          }

          if (!hasTemplate && orientation == tv_orientation) {
            let temp = [item.RpiID,campaign_id,temp_name,1,status,1];
            id_to_add_template.push(temp);
          }

        })

          addTemplateToCampaign();


      });

         function addTemplateToCampaign(){
            connection.query('INSERT INTO AircastRpiCampaign',[id_to_add_template],(error,results,body)=>{
                if (error) throw error;
                if (results){
                  res.send({success: true});  
                }else {
                  res.send({success: false});
                }
                
            });
        }



  console.log('w/o param ' + campaign_id + ' - ' + temp_name + ' - ' + status);
  res.send('w/o param ' + campaign_id + ' - ' + temp_name + ' - ' + status);

});


app.get('/add-template-all/:campaign_name/:temp_name/:status/:parameter',(req,res) => {

  let campaign_name = req.params.campaign_name;
  let temp_name = req.params.temp_name;
  let status = (req.params.status == 'true');
  let parameter = req.params.parameter;
  let all_aircast_sites, all_rpi_campaign;
  let id_to_add_template = [];
  let orientation;
  let recent_campaign_id_list;
  let MyDate = new Date();
  let new_date = MyDate.toMysqlFormat();

  let campaign_list_toInsert = [];
  let campaign_files_toInsert = [];
  let aircast_rpi_campaign_toInsert = [];

  if (aircast_portrait_template.indexOf(temp_name) != -1) {
    orientation = 'portrait';
  }else {
    orientation = 'landscape';
  }


  connection.query("SELECT * FROM AircastRpiLocation; SELECT * FROM AircastRpiCampaign", function(error,results,body) {

    all_aircast_sites = results[0];
    all_rpi_campaign = results[1];

        all_aircast_sites.forEach(function(item){
          let hasTemplate = false;
          let tv_orientation;

          if (aircast_portrait.indexOf(item.RpiID) != -1) {
            tv_orientation = 'portrait';
          }else {
            tv_orientation = 'landscape';
          }

          for (var i = 0; i < all_rpi_campaign.length; i++) {
            if (item.RpiID == all_rpi_campaign[i].RpiID &&  all_rpi_campaign[i].Template  == temp_name) {
              console.log(`match: ${item.RpiID} : item: ${all_rpi_campaign[i].Template}`);
              hasTemplate = true;
              break;
            }
          }

          if (!hasTemplate && orientation == tv_orientation) {
            id_to_add_template.push(item.RpiID);
          }

        })

          // addCampaignParameter();

      });

         function addCampaignParameter(){

            for (var i = 0; i < id_to_add_template.length; i++) {
                var x = [campaign_name,temp_name,new_date,new_date,1,1,1,1];
                campaign_list_toInsert.push(x);

            }

            connection.query('INSERT INTO AircastCampaign (CampaignName,Template,StartDate,EndDate,S3Uploaded,isApproved,UserID,Weight) VALUES ?',[campaign_list_toInsert],function(error,results,body){
              if (results) {
                addAircastCampaign();
              }
            });
        }

        function addAircastCampaign() {
          connection.query("SELECT * FROM AircastCampaign WHERE Template = ? GROUP BY CampaignID LIMIT ?", [temp_name,id_to_add_template.length],function(error,results,body){
              recent_campaign_id_list = results;
              addCampaignFiles();
          });

        }

        function addCampaignFiles(){
          var ctr = 0;
          recent_campaign_id_list.forEach(function(item){
            let x = [item.CampaignID,'source',parameter];
            let y = [id_to_add_template[ctr],item.CampaignID,temp_name,1,status,1];
            campaign_files_toInsert.push(x);
            aircast_rpi_campaign_toInsert.push(y);
            ctr++;
          })

          res.send({success: true});  
        
        }

        

});

app.get('/add-template-one/:id/:campaign/:template/:status/:parameter',function(req,res){
  let rpi_id = req.params.id;
  let campaign_name = req.params.campaign;
  let template_name = req.params.template;
  let status = req.params.status;
  let parameter = req.params.parameter;
  let request1 = false;
  let request2 = false;
  let last_campaign_id = 0;
  let MyDate = new Date();
  let new_date = MyDate.toMysqlFormat();

  connection.query("SELECT * FROM `AircastCampaign` ORDER BY CampaignID DESC LIMIT 1",(error,results,body)=> {
    console.log(results);
      last_campaign_id = results[0].CampaignID + 1;
      addAircastCampaign();
  });


  console.log(rpi_id + '-' +  campaign_name + ' - ' + template_name + ' - ' + status + ' - ' + parameter + ' - ' + last_campaign_id);


  function addAircastCampaign(){
    connection.query("INSERT INTO AircastCampaign (CampaignID, CampaignName, Template, StartDate, EndDate, S3Uploaded, isApproved, UserID, Weight) VALUES (?,?,?,?,?,?,?,?,?)",[last_campaign_id,campaign_name,template_name,new_date,new_date,1,1,1,1],(error,results,body) => {
        addRpiCampaign();
    });

  }


  function addRpiCampaign() {

      connection.query("INSERT INTO AircastRpiCampaign (RpiID, CampaignID, Template, isReady, isEnabled, isPriority) VALUES (?,?,?,?,?,?)",[rpi_id,last_campaign_id,template_name,1,status,1],(error,results,body) => {
        console.log('1st query', results);
          if(results) {
              if (results.affectedRows == 0) {
                request1 = false;
              }else {
                request1 = true;

                connection.query("INSERT INTO AircastCampaignFiles (CampaignID, Filetype, Filename) VALUES (?,?,?)",[last_campaign_id,'source',parameter],(error,results,body) => {
                    console.log('2nd query', results);
                    if(results) {
                      if (results.affectedRows == 0) {
                        request2 = false;
                        checkQuery();
                      }else {
                        request2 = true;
                        checkQuery();
                      }
                    }else {
                      res.send({success: false});
                    }
                });
              }
            }else {
              res.send({success: false});
            }

      });

  }





  function checkQuery(){
    console.log('checking data', request1 + request2);
    if (request1 && request2) {
      res.send({success: true});
    }else {
      res.send({success: false});
    }
  }

})

app.get('/aircast-gallery',(req,res)=>{
  res.render('aircast-gallery');
})

app.route('/aircast-location')
   .get((req,res) => {

        if (rpi_location) {
          res.render("aircast-location",{rpi_location});    
        }else {
          connection.query("SELECT * FROM AircastRpiLocation", function(error,results,body){
            rpi_location = results;   
            res.render("aircast-location",{rpi_location});       
          })
        }
        
   }) 

app.route('/add-template')
   .get((req,res) => {


        connection.query("SELECT * FROM AircastRpiLocation; SELECT * FROM AircastCampaign; SELECT * FROM AircastRpiCampaign WHERE (Template != 'temp2' and Template != 'temp4' and Template != 'temp1') GROUP BY Template", function(error,results,body){
           rpi_location = results[0];
           aircast_campaign = results[1];
           template_list = results[2];
           res.render('add-template',{rpi_location,aircast_campaign,template_list});
        })
   })

app.route('/show-campaigns')
  .get((req,res) => {

      connection.query("SELECT * FROM AircastRpiLocation", function(error,results,body){
          rpi_location = results;
          res.render("show-campaigns",{rpi_location,moment});
       }); // end of 1st query      
  })



app.route('/show-campaigns/:id')
  .get((req,res) => {

      var RpiID =  req.params.id;

        connection.query("SELECT * FROM AircastRpiLocation;SELECT * FROM AircastCampaign;SELECT * FROM AircastCampaignFiles;SELECT * FROM AircastRpiCampaign", function(error,results,body){
            rpi_location = results[0];
            aircast_campaign = results[1];
            campaign_files = results[2];
            rpi_campaign_complete = results[3];

            res.render("campaign-item",{ID:RpiID,rpi_location,aircast_campaign,campaign_files,rpi_campaign_complete,moment});
       
       }); // end of 1st query   

    
  })

app.route('/aircast-quarantine')
  .get((req,res) => {
    res.render('aircast-quarantine');
  });

app.get('/aircast-issue-tracker',(req,res) => {

    if (rpi_location) {
      res.render("aircast-issue",{rpi_location});    
    }else {
      connection.query("SELECT * FROM AircastRpiLocation", (error,results,body) => {
        rpi_location = results;   
        res.render("aircast-issue",{rpi_location});       
      })
    }

});

app.get('/aircast-site-report',(req,res) => {
      res.render("aircast-site-report");        
});

app.route("/api/rpi-location")
   .get((req,res) => {
      connection.query("SELECT * FROM AircastRpiLocation",(error,results,body)=>{
        res.json(results);
      });
   })

app.route("/api/rpi-location")
  .get((req,res) => {
    connection.query("SELECT * FROM AircastRpiLocation",(error,results,body)=>{
      res.json(results);
    });
  })

app.route('/save-issue')
  .post((req,res) =>{
    const sql = "INSERT INTO  `gp_digital`.`aircast_issue` ("+
    " `id` ,"+
    " `date_detected` ,"+
    " `site_name` ,"+
    " `issue` ,"+
    " `date_of_resolution` ,"+
    " `status` ,"+
    " `resolution` ,"+
    " `remarks` ,"+
    " `timestamp`"+
    " )"+
    "  VALUES ("+
    " NULL ,  ?,  ?,  ?,  ?,  ?,  ?,  ?, CURRENT_TIMESTAMP );";
    let dateDetected  = req.body.date_detected;
    let siteName      = req.body.site_name;
    let issue         = req.body.issue;
    let dateResolved  = req.body.date_resolution;
    let status        = req.body.status;
    let resolution    = req.body.resolution;
    let remarks       = req.body.remarks;
    connection.query(sql,[
      dateDetected,
      siteName,
      issue,
      moment(dateResolved).format('YYYY-MM-DD'),
      status,
      resolution,
      remarks
    ],(error,results,body) => {
      console.log(results);
      res.send({success: true});  
    });
  });
app.route('/select-issue')
    .get((req,res)=>{
      connection.query("SELECT * FROM  `aircast_issue`;",(error,results,body)=>{
        res.json(results);
      });
    });
app.route('/edit-issue')
    .post((req,res) => {
      const sql = "UPDATE  `gp_digital`.`aircast_issue` SET "+
                    " `site_name` =  ? ,"+
                    " `issue` =  ? ,"+
                    " `resolution` =  ? ,"+
                    " `status` =  ? ,"+
                    " `remarks` =  ? ,"+
                  " `date_of_resolution` =  ? WHERE  `aircast_issue`.`id` = ? ;";
      //let dateDetected;
      let siteName        = req.body.site_name;
      let issue           = req.body.issue;
      let resolution      = req.body.resolution;
      let status          = req.body.status;
      let remarks         = req.body.remarks;
      let dateResolution  = req.body.date_resolution;
      let id              = req.body.issue_id;
      connection.query(sql,[
       // dateDetected,
        siteName,
        issue,
        resolution,
        status,
        remarks,
        moment(dateResolution).format('YYYY-MM-DD'),
        id
      ],(error,results,body) => {
        console.log(results);
      });
      // console.log('sadgashjdgajshgdjashgdjahsgdjashgda');
    });
app.route('/issues')
      .get((req,res)=>{
        const sql = "SELECT * "+
                    "FROM  `aircast_issue_list` ";
        connection.query(sql,(error,result,body)=>{
          console.log(result);
          res.json(result);
        })
      });
app.route('/issue-add')
  .post((req,res)=>{
    const sql = "INSERT INTO  `gp_digital`.`aircast_issue_list` ("+
                " `id` ,"+
                " `Name`"+
                " )"+
                " VALUES ("+
                " NULL ,  ?"+
                " );";
    let name = req.body.name;
    connection.query(sql,[name],(error,result,body)=>{
      // resolve.json(result);
      console.log(result);
      res.send({success: true});  
    })
  });
app.route('/del-issue')
  .post((req,res)=>{
    const sql = "DELETE FROM `gp_digital`.`aircast_issue_list` WHERE `aircast_issue_list`.`Name` = ?";
    let name = req.body.name;
    connection.query(sql,[name],(error,results,body)=>{
      console.log(results);
      res.send({success: true});
    })
  })
app.get('*',(req,res)=> {
  res.send('<h1>Page Not Found.</h1>');
});


app.listen(server_port, function() {
	console.log('starting server at port ' + server_port);
});


