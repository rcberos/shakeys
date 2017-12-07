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
    rpi_campaign,
    rpi_location;

var connection = mysql.createConnection({
  host     : 'maindb.com4k2xtorpw.ap-southeast-1.rds.amazonaws.com',
  user     : 'Gameplandigital',
  password : 'Gameplan01',
  database : 'gp_digital'
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
          console.log(results2[0]);
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
          console.log('error:', error); // Print the error if one occurred
          console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
          console.log('body:', body); // Print the HTML for the Google homepage.
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
        res.render('templates-manager',{results: rpi_location,moment:moment});
      }else {
        connection.query("SELECT * FROM AircastRpiLocation", function(error,results,body){
        rpi_location = results;        
         res.render('templates-manager',{results: results,moment:moment});
        })
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
      
      if (rpi_campaign) {
        res.render('templates-item',{ID:RpiID,rpi_location:rpi_location, rpi_campaign: rpi_campaign,campaign_files:campaign_files,moment:moment});
      }else {
        console.log("getting data");
        connection.query("SELECT * FROM AircastRpiCampaign WHERE (Template != 'temp2' and Template !='temp4' and Template !='temp1')",function(error,results,body){
          rpi_campaign = results;

          connection.query("SELECT * FROM AircastCampaignFiles",function(error2,results2,body2){
            campaign_files = results2;
            res.render('templates-item',{ID:RpiID,rpi_location:rpi_location,rpi_campaign: rpi_campaign,campaign_files:campaign_files,moment:moment});
          }) //end of 2nd query
        }) // end of 1st query
      }
      
      // res.render()
  })

app.route("/update-campaign/:id/:param")
   .post((req,res) => {
      var id = req.params.id;
      var new_param = req.params.param;

      connection.query("UPDATE AircastCampaignFiles SET FileName = ? WHERE CampaignID = ?",[new_param,id],function(error,results,body){
        if (results.changedRows == 0) {
          res.send('failed');
        }else {
          res.send('success');
        }
        rpi_location = '', rpi_campaign = '';
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
        if (results.changedRows == 0) {
          res.send('failed');
        }else {
          res.send('success');
        }
        rpi_location = '', rpi_campaign = '';
      });
   })

app.route('/aircast-location')
   .get((req,res) => {
      res.render("aircast-location");
   }) 

app.listen(server_port, function() {
	console.log('starting server at port ' + server_port);
});


