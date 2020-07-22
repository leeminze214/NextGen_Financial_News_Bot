const Discord = require('discord.js');
//requesting discord.js that will be named discord
const fetch = require('node-fetch');
const client = new Discord.Client();
//this is the"bot
const auth = require('./auth.json');

//getting auth.json from directory which will be named
const signature = auth.signature;
//getting sig and iex token from auth.json
const iextoken = auth.iextoken;

client.on("ready", () => {
  console.log("i hate you");
});

client.on("message", async (msg) => {
  if(msg.content.substring(0, signature.length) == signature){
    const refined = msg.content.substring(signature.length);

    if (refined.startsWith("articles")){
      let stoc = msg.content.substring(signature.length+"articles".length).trim()
      let stock = stoc.toUpperCase();
      console.log(stock);
      if (stock != ""){
        articles(stock,msg);
        };
      };
    };
  });

async function articles(stock, msg){
  let fetch_time;
  let start_time = new Date().getTime();
  let links = await get_articles(stock);
  console.log(links);
  var scoring = {"lang":{"en":200},"source": {"InvestorPlace":3,"MarketWatch":3,"Business Insider":2, "Yahoo Finance":3},
  "hasPaywall": {"false": 100}};
  fetch_time = 'This result was fetched in '+ (new Date().getTime() - start_time) +"ms";
  if (links == "not found") {
    msg.reply("Invalid input! Please enter a valid ticker symbol.");
  }else if (links.length == 0 || links == "crypto") {
    msg.reply("Sorry, no articles found on "+stock);
  }else{
    var scored = score_articles(links,scoring);
    var TO_return = await sort_top_articles(scored,scoring);
    await embeded(TO_return,fetch_time,stock,msg);
  };
  console.log("articles is working just fine yayy");
};


//function that will fetch all the articles
async function get_articles(stock){
  console.log(stock);
  var no_crypto = ["ETH", "BCH","LTC","NEO"];
  let to_return;
  await fetch('https://cloud.iexapis.com/stable/stock/'+stock+'/news/last/6?token='+iextoken)
  .then(res => res.json())
  .then(json => {
    to_return = json;
  }).catch(err => {
    to_return = "not found";
  });
  console.log("Get_artilces is wroking");
  if (no_crypto.includes(stock)) {
    to_return = "crypto";
  }
  return to_return;
};


// adds a score based on scoring to each json article response
function score_articles(json,scoring){
  let all = [];
  let factors = Object.keys(scoring);
  for (var i = 0; i < json.length; i++) {
    var score = 0;
    var article = json[i];
    if (article.hasPaywall == false){
      article.hasPaywall = "false";
    }else {
      article.hasPaywall = "true";
    };
    for (var j = 0; j < factors.length; j++) {
      let each_factor = Object.keys(scoring[factors[j]]);//criteria value en, InvestorPlace-MarketWatch
      let factor_value = article[factors[j]];//article value en, business,true
      for (var z = 0; z < each_factor.length; z++) {
        if (article[factors[j]] == [each_factor[z]]) {
          score += scoring[factors[j]][each_factor[z]];
        };
      };
    };
    article.score = score;
    all.push(article);
  };
  console.log("scoring articles is working");
  return all;
};

//sorts articles based on their "score" property and returns top 3
function sort_top_articles(scored,scoring){
  let all_scored = [];
  const len = scored.length;
  let index;
  let article;
  let to_return = [];
  while (all_scored.length != len) {

    let best = 0;
    for (var i = 0; i < scored.length; i++) {
      if (scored[i]["score"] >= best) {
        best = scored[i]["score"];
        article = scored[i];
        index = i;
      };
    };
    scored.splice(index,1);
    all_scored.push(article);
  };
  //getting rid non-eng, despite its score
  for (var i = 0; i < all_scored.length; i++) {
    if (all_scored[i].lang == "en") {
      to_return.push(all_scored[i]);
    };
  };
  console.log("sort is wroking");
  if (to_return.length <= 3){
    return to_return.slice(0,to_return.length);
  }else{
    return to_return.slice(0,3);
  };
};

//reply with formulated embed
async function embeded(top_3_articles,fetch_time,stock,msg){

  let embed = new Discord.MessageEmbed();
  embed.setTitle("Articles for "+stock);
  embed.setColor(0x34b7eb);
  for (var i = 0; i < top_3_articles.length; i++) {
    embed.addFields({
    name: top_3_articles[i]["headline"],
    value:"[ Press here ](" + top_3_articles[i]["url"] + ")"
    });
  };
  embed.setThumbnail('https://storage.googleapis.com/iex/api/logos/'+stock+'.png');
  embed.setFooter(fetch_time);
  console.log("embeded is wroking");
  msg.reply(embed);
};

client.login(auth.discordToken);
