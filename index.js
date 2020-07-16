const Discord = require('discord.js');
//requesting discord.js that will be named discord
/*fsf*/
const yahooFinance = require('yahoo-finance');
const client = new Discord.Client();
//this will be the"bot
const auth = require('./auth.json');
//getting auth.json from directory which will be named
const signature = auth.signature;
//getting sig from auth.json
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('acc66ff9aaaa404d927ee8ea8d10fce4');



//-------------------------------
client.on("ready", () => {
  console.log("i hate you");
});
//when 'ready' =>(when its ready) do this
//"message", when recievs a message
//"dissconnect", when dissconnects
//logging something into console

client.on("message", (msg) => {
  if(msg.content.substring(0, signature.length) == signature){
    const refined = msg.content.substring(signature.length);

    if (refined.startsWith("help")){
      helplist(msg)
    }
    else if (refined.startsWith("articles")){
      var topic = msg.content.substring(signature.length+"articles".length)
      if (topic != ""){
        articles(msg,topic)}
    }

    /*else if (refined.startsWith("lookup")){
      lookup(msg);*/
    }
    //console.log(msg.content);
    //msg.channel.send(refined);
    //msg.reply('hello');
  });
//asyn = wait prerequisites its ready
//=>
async function articles(msg,topic){

  var results = await newsapi.v2.everything({
  q: topic,
  from: '2020-7-1',
  to: '2020-7-12',//todo add date and time
  language: 'en',
  sortBy: "relevency"
});
  var embed = new Discord.MessageEmbed();
  embed.setTitle("Articles for"+topic);
  embed.setColor(0x34b7eb);
  var count = 0
  console.log(results.articles.length)
  for (i = results.articles.length-1; i > 0; i-= 1) {
    var temp = topic.trim()
    var keywords = temp.substring(0, 1).toUpperCase() + temp.substring(1)
    if (results.articles[i].title.includes(keywords) && count < 3){
      embed.addFields({
        name:results.articles[i].title,
        value:"[ Press here ](" + results.articles[i].url + ")"
      })
      count += 1;
    }
  }
  msg.reply(embed);

}
/*
function().then( () => {

}).catch( (error) => {
  console.log(error);
  msg.reply('uh oh! an error!');
});
*/


/*
function helplist(msg){
  var embed = new Discord.MessageEmbed();
  embed.setTitle("Here is a guide for our investment bot! ('ng!help')");
  embed.setColor(0xff0000);
  embed.addFields(
    {name:"Initialize your account",value:"ng!init"},
    {name:"List of functions",value:"ng!help"},
    {name:"Collect your daily awards!",value:"ng!daily"},
    {name:"List your networth and balance",value:"ng!balance"},
    {name:"Buy X shares of a stock",value:"ng!buy stock (symbol) (amount in shares)"},
    {name:"Buy X shares of a crypto",value:"ng!buy crypto (symbol) (amount in shares)"},
    {name:"Sell X shares of a stock",value:"ng!sell stock (symbol) (amount in shares)"},
    {name:"Sell X shares of a crypto",value:"ng!sell crypto (symbol) (amount in shares)"},
    {name:"Sell ALL of a stock or crypto",value:"ng!sell (symbol) all"},
    {name:"List all your stocks and crypto",value:"ng!list all"},
    {name:"List all your cryptos",value:"ng!list crypto"},
    {name:"List all your stocks",value:"ng!list stock"},

  );
  msg.reply(embed);
}
*/


async function lookupamz(msg){
  const result = await yahooFinance.quote({
//await only under async
//async is for the function to wait cuz normally it goes in parralel
    symbol : "amzn",
    modules : ["price"]
  });
  var embed = new Discord.MessageEmbed();
  embed.setAuthor("Lee");
  embed.setTitle("luv u");
  embed.setColor(0xff0000);
  embed.addFields(
    {name:"name",value:"value",inline:true},
    {name:"hi",value:result.price.regularMarketPrice,inline:true}
  );
  msg.reply(embed);
}



client.login(auth.discordToken);
