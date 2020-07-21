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
      let stock = msg.content.substring(signature.length+"articles".length).trim();
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
  fetch_time = 'This result was fetched in '+ (new Date().getTime() - start_time) +"ms";
  if (links == "not found") {
    msg.reply("Invalid input! Please enter a valid ticker symbol.");
  }else{
    var scored = score_articles(links);
    var TO_return = await sort_top_articles(scored);
    console.log(TO_return);
    await embeded(TO_return,fetch_time,stock,msg);
  };
  console.log("articles is working just fine yayy");
};


//function that will fetch all the articles
async function get_articles(symbol){
  let to_return;
  await fetch('https://cloud.iexapis.com/stable/stock/'+symbol+'/news/last/6?token='+iextoken)
  .then(res => res.json())
  .then(json => {
    to_return = json;
  }).catch(err => {
    to_return = "not found";
  });
  console.log("Get_artilces is wroking");
  return to_return;
};

// adds a score to each json article response
function score_articles(json){
  let all = [];
  let scoring = {"lang":{"en":69},"source": {"InvestorPlace":3,"MarketWatch":3,"Business Insider":2, "Yahoo Finance":3},
    "hasPaywall": {"false": 100}};
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
function sort_top_articles(scored){
  let all_scored = [];
  let article;
  let index;
  console.log(scored);
  while (all_scored.length != scored.length) {
    let best = 0;
    for (var i = 0; i < scored.length; i++) {
      console.log(scored[i]["score"], best);
      if (scored[i]["score"] >= best) {
        best = scored[i]["score"];
        article = scored[i];
        index = i;
        console.log("heye");
      };
    };
    scored.splice(index,1);
    all_scored.push(article);
  };
  console.log("sort is wroking")
  return all_scored;
};

//reply with formulated embed
async function embeded(top_3_articles,fetch_time,stock,msg){
  console.log(top_3_articles);
  var stock_upper = stock.toUpperCase();
  let embed = new Discord.MessageEmbed();
  embed.setTitle("Articles for "+stock_upper);
  embed.setColor(0x34b7eb);
  for (var i = 0; i < top_3_articles.length; i++) {
    embed.addFields({
    name: top_3_articles[i]["headline"],
    value:"[ Press here ](" + top_3_articles[i]["url"] + ")"
    });
  };
  embed.setThumbnail('https://storage.googleapis.com/iex/api/logos/'+stock_upper+'.png');
  embed.setFooter(fetch_time);
  console.log("embeded is wroking");
  msg.reply(embed);
};

client.login(auth.discordToken);
