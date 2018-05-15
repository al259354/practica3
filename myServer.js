const application_root=__dirname,
    express = require("express"),
    path = require("path"),
    bodyparser=require("body-parser");

const ctrl = require('./controllers');

var app = express();
app.use(express.static(path.join(application_root,"public")));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

//Cross-domain headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/',ctrl.sendStatic);

app.post('/stream', (req)=>{
	ctrl.addStream(req.body[0])}
	);

app.get('/streams',ctrl.sendDatasets);

app.get('/stream/graph',ctrl.graph);

app.get('/stream/:name',ctrl.tweets);

app.get('/stream/:name/words',ctrl.histograma);

app.get('/stream/:name/polarity',ctrl.polaridades);

app.get('/stream/:name/geo',ctrl.geolocalizacion);


ctrl.warmup.once("warmup", _ => {
   console.log("Web server running on port 8080");
   app.listen(8080);
});

app.listen(8080,	function	()	{
		console.log("the	server	is	running!");
});
