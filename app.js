const express 	= require('express'),
	bodyParser 	= require('body-parser'),
	cors 		= require('cors'),
	mysql		= require('mysql'),
  request = require('request'),
  moment  = require('moment'),
	app 		= express();

const server_port = process.env.PORT || this.SERVER_PORT || 5000;
const env = process.env.NODE_ENV || 'development';

var site_data,
    last_message,
    campaign_files,
    aircast_campaign,
    rpi_campaign,
    rpi_campaign_complete,
    rpi_location,
    template_list;

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

app.route("/textblast")
   .get((req,res) => {

   		connection.query("SELECT Room,ContactPerson,ContactPersonName FROM AircastRpiLocation WHERE ContactPerson != 0", function(error,results,fields){
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

      if (rpi_location) {
        res.render('templates-manager',{rpi_location,moment:moment});
      }else {
        connection.query("SELECT * FROM AircastRpiLocation; SELECT * FROM AircastRpiCampaign WHERE (Template != 'temp2' and Template !='temp4' and Template !='temp1'); SELECT * FROM AircastCampaignFiles",function(error,results,body){
          rpi_location = results[0];
          rpi_campaign = results[1];
          campaign_files = results[2];
          res.render('templates-manager',{rpi_location,moment:moment});
        }) //end of 1nd query

      }
            
  })

app.route("/templates-manager/:id")
  .get((req,res)=>{
      var RpiID =  req.params.id;
      console.log(rpi_campaign);

      if (rpi_location) {
        rpi_location = rpi_location;
      }else {
        connection.query("SELECT * FROM AircastRpiLocation", function(error,results,body){
          rpi_location = results;        
        })
      }
      
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
      var id = req.params.id;
      var new_param = req.params.param;

      connection.query("UPDATE AircastCampaignFiles SET FileName = ? WHERE CampaignID = ?",[new_param,id],function(error,results,body){
        console.log(results);
        if (results) {
          if (results.changedRows == 0) {
            console.log('query failed');
            res.send('failed');
          }else {
            console.log('query success');
            res.send('success');
          }
          rpi_location = '', rpi_campaign = '';
        }else {
           res.send('failed');
        }
        
      });

   })

app.route("/toggle-campaign/:rpiid/:campaign_id/:status")
   .post((req,res) => {
      var status = req.params.status;
      var campaign_id = req.params.campaign_id;
      var rpi_id = req.params.rpiid;

      var query = 'UPDATE AircastRpiCampaign SET isEnabled = '+status+' WHERE CampaignID = '+campaign_id+' and RpiID = '+rpi_id;
      console.log(query);

      connection.query(query,function(error,results,body){
        if(results) {
          if (results.changedRows == 0) {
            console.log('query failed');
            res.send('failed');
          }else {
            console.log('query success');
            res.send('success');
          }
          rpi_location = '', rpi_campaign = '';  
          }else {
            res.send('failed');
          }
      });
   })


app.get('/add-template-one/:id/:campaign/:template/:status',function(req,res){
  let rpi_id = req.params.id;
  let campaign_id = req.params.campaign;
  let template_name = req.params.template;
  let status = req.params.status;


  connection.query("INSERT INTO AircastRpiCampaign (RpiID, CampaignID, Template, isReady, isEnabled, isPriority) VALUES (?,?,?,?,?,?)",[rpi_id,campaign_id,template_name,1,status,1],(error,results,body) => {
      if(results) {
          if (results.affectedRows == 0) {
            res.send('failed');
          }else {
            res.send('success');
          }
        }else {
          res.send('failed');
        }

  });
})

app.get('/add-template-one/:id/:campaign/:template/:status/:parameter',function(req,res){
  let rpi_id = req.params.id;
  let campaign_id = req.params.campaign;
  let template_name = req.params.template;
  let status = req.params.status;
  let parameter = req.params.parameter;
  let request1 = false;
  let request2 = false;

  connection.query("INSERT INTO AircastRpiCampaign (RpiID, CampaignID, Template, isReady, isEnabled, isPriority) VALUES (?,?,?,?,?,?)",[rpi_id,campaign_id,template_name,1,status,1],(error,results,body) => {
    console.log('1st query', results);
      if(results) {
          if (results.affectedRows == 0) {
            request1 = false;
          }else {
            request1 = true;

            connection.query("INSERT INTO AircastCampaignFiles (CampaignID, Filetype, Filename) VALUES (?,?,?)",[campaign_id,'source',parameter],(error,results,body) => {
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
                  res.send('failed');
                }
            });
          }
        }else {
          res.send('failed');
        }

  });



  function checkQuery(){
    console.log('checking data', request1 + request2);
    if (request1 && request2) {
      res.send('success');
    }else {
      res.send('failed');
    }
  }

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

      if (rpi_location && aircast_campaign && template_list) {
        res.render('add-template',{rpi_location,aircast_campaign,template_list});
      }else {
        connection.query("SELECT * FROM AircastRpiLocation; SELECT * FROM AircastCampaign; SELECT * FROM AircastRpiCampaign WHERE (Template != 'temp2' and Template != 'temp4' and Template != 'temp1') GROUP BY Template", function(error,results,body){
         rpi_location = results[0];
         aircast_campaign = results[1];
         template_list = results[2];
         res.render('add-template',{rpi_location,aircast_campaign,template_list});
        })
      }
   })

app.route('/show-campaigns')
  .get((req,res) => {

      connection.query("SELECT * FROM AircastRpiLocation;SELECT * FROM AircastCampaign;SELECT * FROM AircastCampaignFiles;SELECT * FROM AircastRpiCampaign", function(error,results,body){
          rpi_location = results[0];
          aircast_campaign = results[1];
          campaign_files = results[2];
          rpi_campaign_complete = results[3];

          res.render("show-campaigns",{rpi_location,aircast_campaign,campaign_files,rpi_campaign_complete,moment});
       }); // end of 1st query      
  })

app.route('/show-campaigns/:id')
  .get((req,res) => {

      var RpiID =  req.params.id;

      // if (rpi_location && campaign_files && aircast_campaign && rpi_campaign_complete) {
      //   res.render("campaign-item",{ID:RpiID,rpi_location,aircast_campaign,campaign_files,rpi_campaign_complete,moment});
      // }else {
      //   connection.query("SELECT * FROM AircastRpiLocation;SELECT * FROM AircastCampaign;SELECT * FROM AircastCampaignFiles;SELECT * FROM AircastRpiCampaign", function(error,results,body){
      //       rpi_location = results[0];
      //       aircast_campaign = results[1];
      //       campaign_files = results[2];
      //       rpi_campaign_complete = results[3];

      //       res.render("campaign-item",{ID:RpiID,rpi_location,aircast_campaign,campaign_files,rpi_campaign_complete,moment});
       
      //  }); // end of 1st query   
      // }

        connection.query("SELECT * FROM AircastRpiLocation;SELECT * FROM AircastCampaign;SELECT * FROM AircastCampaignFiles;SELECT * FROM AircastRpiCampaign", function(error,results,body){
            rpi_location = results[0];
            aircast_campaign = results[1];
            campaign_files = results[2];
            rpi_campaign_complete = results[3];

            res.render("campaign-item",{ID:RpiID,rpi_location,aircast_campaign,campaign_files,rpi_campaign_complete,moment});
       
       }); // end of 1st query   

    
  })

app.route("/api/rpi-location")
   .get((req,res) => {
      connection.query("SELECT * FROM AircastRpiLocation",(error,results,body)=>{
        res.json(results);
      });
   })


app.listen(server_port, function() {
	console.log('starting server at port ' + server_port);
});


