const Discord = require('discord.js');
//requesting discord.js that will be named discord
const fetch = require('node-fetch');
const client = new Discord.Client();
//this will be the"bot
const auth = require('./auth.json');
//getting auth.json from directory which will be named
const signature = auth.signature;
//getting sig and iex token from auth.json
const iextoken = auth.iextoken;

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

    if (refined.startsWith("articles")){
      var stock = msg.content.substring(signature.length+"articles".length).trim()
      if (stock != ""){
        articles(msg,stock)
      }
    }
  }
});
async function articles(msg,stock){
  try{
  var name = stock.toUpperCase();
  var req = 'https://cloud.iexapis.com/stable/stock/'+stock+'/news/last/6?token='+iextoken
  start_time = new Date().getTime();
  var links = await fetch(req);
  var time = 'This result was fetched in '+ (new Date().getTime() - start_time) +"ms";
  var real_links = await links.json();
}catch{
  msg.reply("Sorry, invalid ticker symbol!");
};
  var priorities = {"MarketWatch":[],"InvestorPlace":[], "Business Insider":[]};
  var embed = new Discord.MessageEmbed();
  embed.setTitle("Articles for "+name);
  embed.setColor(0x34b7eb);
  filter(embed,real_links,priorities,time);
  msg.reply(embed);
};

function filter(embed,real_links,priorities,time){
  var count = 0;
  for (i = real_links.length-1; i > 0; i-= 1) {
    if (Object.keys(priorities).includes(real_links[i].source) && real_links[i].lang == "en" && count < 3){
      embed.addFields({
        name:real_links[i].headline,
        value:"[ Press here ](" + real_links[i].url + ")"
      });
      count++;
    }
    else if (real_links[i].lang == "en" && count <3 && real_links[i].headline.substring(0,6) != "How to"){
    embed.addFields({
      name:real_links[i].headline,
      value:"[ Press here ](" + real_links[i].url + ")"
    });
    embed.setThumbnail(real_links[i].image);
    count++;
    }
  };
  embed.setFooter(time);
};
client.login(auth.discordToken);
