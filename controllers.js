const db=require('./myStorage');
const Freq = require('wordfrequenter');
const stream = require('./myStream');
const https=require('https');
const	mng=require('mongoose');
const	my_conn_data="mongodb://usuario:labora2000@ds117200.mlab.com:17200/al259354";



let  DB = new db.myDB('./data');

exports.sendStatic    = (req,res) => res.sendFile("public/index.html",{root:application_root});

exports.sendDatasets  = (req,res) => res.send({result: DB.getDatasets()}); 

exports.sendCounts    = (req,res) => res.send({error:"No operativo!"});

exports.sendLastPosts = (req,res) => {
    let n = (req.query.n == null) ? 10 : parseInt(req.query.n);
    DB.getLastObjects(req.params.name,n,data => res.send(data));
};

//pon aqui tus funciones adicionales! 
exports.addStream = (json)=>{

	mng.connect(my_conn_data);

	let	itemSchema	=	new	mng.Schema({
		"@context"	:		String,
		"@type"	: 			String, 
		query	:	   		String,
		startTime	:		Date,
		agent	:	{
			"@type"	:  		String,
			name	: 		String  
		},
		object	:	{
			"@type"	:   	String,
			identifier	: 	String,
			url	: 			String   
		}
});


	let itemModel = mng.model('Item', itemSchema);

	let name = json.name;
	let track = json.track;

	let description = jsonld(name, track, 'yo', '/stream/'+name+'');

	let midato = new itemModel(description);

	midato.save();

	let SM=new stream.StreamManager();

SM.DB.events.once("warmup", _ =>{
	
	SM.createStream(name, track, description);
        setTimeout(_=> SM.destroyStream(name),50000);

});

};

exports.polaridades = (req,res) => {
    DB.getLastObjects(req.params.name,100, response => {
    	let lista = response.result;
		let valores =[0,0,0];	
		for(let i =0; i<lista.length;i++){
			if(typeof lista[i].sentiment=="string"){
				var p = parseInt(lista[i].sentiment.split(",").slice(-1)[0]);
				if(p==0) valores[0]++;
				else if (p>0) valores[1]++;
				else valores[2]++;
			}
			
		}
		let json = {
			'positive': valores[1],
			'negative': valores[2],
			'neutral': valores[0],
		    }

	 	res.send({'result':json});
		  });
    };

exports.histograma = (req,res) => {
    DB.getLastObjects(req.params.name,50, response => {
            let lista = response.result;
		    let texto;
		    let n = (req.query.top == null) ? 20 : parseInt(req.query.top);

		    for(var i = 0; i < lista.length;i++){
		    	texto+=lista[i].text.replace(/\n/g, '');				
			}
			let wf = new Freq(texto.split(' '));
			wf.set('string');
			let palabras = wf.list();
			let json = []; 
			for(var i=palabras.length, j=0;i>palabras.length-n;i--,j++){
				json.push([palabras[i-1].word, palabras[i-1].count]);
			}
			res.send({'result':json});
                   
                 });
};

exports.geolocalizacion = (req,res) => {
    DB.getLastObjects(req.params.name,100, response => {
            let lista = response.result;
		    let json={}; 
		    for(var i = 0; i < lista.length;i++){
			if (lista[i].coordinates!=null) 
                json[lista[i].tweetId]=lista[i].coordinates;
		    }
		    
		    res.send({'result':json});
                   
                 });
};

exports.tweets= (req, res) =>{
	DB.getLastObjects(req.params.name,100, response => {
		let lista = response.result;
		let n = (req.query.limit == null) ? 10 : parseInt(req.query.limit);
		res.send({'result':lista.slice(0,n).map(x=>x.tweetId)})
	});
};

function jsonld (name, track, creador, uri){
        let jsonld ={
                "@context":"http://schema.org",
                "@type:":"SearchAction",
                "query":track,
                "startTime":Date(),
                "agent":{
  						"@type":"Person",
                        "name":creador
                },
                "object":{
                        "@type":"Thing",
                        "identifier":name,
                        "url":uri
                }
        };
       
        return jsonld;
};

exports.graph = (req, res)=> { 
https.get("https://api.mlab.com/api/1/databases/al259354/collections/items?apiKey=HmBfKhMdCv1bbQnfOpYprThEOxgFC-P_", response=>{
   response.on('data',result=>{
     var data=JSON.parse(result);
     res.send({'@graph': data});
   }); //res
    
  }); 
};




exports.warmup = DB.events;
