const Twitter = require('twitter');
const myCreds = require('./credentials/my-credential.json');
const db = require('./myStorage');
const util=require('util');
const cont=require('./controllers')

const client = new Twitter(myCreds);
const sentiment = require('sentiment-spanish');


class StreamManager{
   constructor(){
     this.streams={}; //clave es el nombre y el valor el objeto stream
     this.DB=new db.myDB('./data');
   }

   createStream(name,track, description){

     let stream = client.stream('statuses/filter', {track: track});

     this.streams[name]=stream;
     this.DB.createDataset(name,description);

     stream.on('data', tweet => {
  	if (tweet.lang=="es" || tweet.user.lang=="es"){
	 	    this.DB.insertObject(name,{"tweetId":tweet.id_str,"text":tweet.text,"coordinates":tweet.coordinates,"sentiment":sentiment(tweet.text).score});
     		console.log(tweet.id_str,tweet.text, tweet.coordinates);
     		console.log("Sentiment score:",sentiment(tweet.text).score);
       
        console.log();
     		console.log("-------------------------------------------");
  	}
     });

     stream.on('error', err => console.log(err));

   }//create

   destroyStream(name){
     this.streams[name].destroy();
     this.DB.getMetaData(metadata => console.log(metadata));
     delete this.streams[name];
   }

  
}
exports.StreamManager=StreamManager;




