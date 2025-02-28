const Discord = require("discord.js");
const bot = new Discord.Client();
require("dotenv").config();
const obj = require("./embed.js");
const crypto = require('crypto');

// true = on, false = off
const soundtoggle = true;
const linktoggle = true;
const spoilertoggle = false;

bot.on("ready", () => {
  console.log("WoMBot " + womversion + " is starting up.");
  console.log("Dice Sounds are " + (soundtoggle ? "on." : "off."));
  console.log("3D Dice Link is " + (linktoggle ? "on." : "off."));
  console.log("Spoiler rolls & draws is " + (spoilertoggle ? "on." : "off."));
  console.log(`The command prefix is '${prefix}'`);
  console.log("WoMBot " + womversion + " is now online.");
  console.log("---");
});

const prefix = process.env.BOT_PREFIX || "!";
const womversion = "v1.5.1";
const minor_suits = ["Wands", "Pentacles", "Swords", "Cups"];
const minor_values = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
const major_values = ["0 - The Fool", "1 - The Magician", "2 - The High Priestess", "3 - The Empress", "4 - The Emperor", "5 - The Hierophant", "6 - The Lovers", "7 - The Chariot", "8 - Strength", "9 - The Hermit", "10 - The Wheel of Fortune", "11 - Justice", "12 - The Hanged Man", "13 - Death", "14 - Temperance", "15 - The Devil", "16 - The Tower", "17 - The Star", "18 - The Moon", "19 - The Sun", "20 - Judgement", "21 - The World"];
const wm_effects = ["Caster regains all lost Essence from their brief connection to the Wyld", "A nearby spirit merges with the caster imparting a Trauma until the spirit is Banished", "Ringing in the caster’s ears makes Concentration impossible for the rest of the Undertaking", "Modify the Wyld Magic's Scale or Area by randomresult", "Modify the Wyld Magic's Duration by randomresult", "Modify the Wyld Magic's Range by randomresult", "Caster’s randombodypart into that of a random animal", "A randomly chosen angry mythical creature appears nearby and is focused on the caster", "A randomly chosen angry mythical creature appears nearby and is focused on spell’s target", "Caster loses all Essence; gains increased effect on all non-mental & non-magical Action rolls", "Caster becomes Disconnected from their magic until the end of the Undertaking or Downtime", "Caster is trapped between worlds (for at least one Undertaking, returning with new Trauma)", "If the effect is elemental in nature, substitute another element at random", "If the Wyld Magic has a target, a new target is chosen by a seemingly malevolent force"];

var voiceChan = "";
var rollType = "";
var url_start = "http://dice.bee.ac/?";
var dice_types = "d=Xd6@";
var user = "&user=placeholder_user";
var type = "&type=placeholder_type";
var url_end = "&shadows=0&noresult&dicescale=2&roll";
var complete_url = "";

let cryptoFailCount = 0;
const CRYPTO_FAIL_THRESHOLD = 3;

function rand(min, max) {
  return (Math.floor(Math.pow(10, 14) * Math.random() * Math.random()) % (max - min + 1)) + min;
}

function cryptoRand(min, max) {
  return new Promise((resolve) => {
    if (cryptoFailCount >= CRYPTO_FAIL_THRESHOLD) {
      // Fallback to rand if crypto fails too many times
      resolve(rand(min, max));
      return;
    }
    crypto.randomInt(min, max + 1, (err, number) => {
      if (err) {
        console.error('cryptoRand error:', err);
        cryptoFailCount++;
        resolve(rand(min, max)); // Fallback
      } else {
        cryptoFailCount = 0; // Reset fail count on success
        resolve(number);
      }
    });
  });
}

const roll = {
  //Parsing the user's string. Obtaining dice number (max 10), resist bool, draw bool, comment.
  parse(content) {
    const data = {};

    data.statement = content;

    //Comment handling
    data.comment = ""; //Avoids concat "undefined" with "\n I'm limited...."
    if (content.includes("/")) {
      data.comment = "\n" + content.slice(content.indexOf("/") + 1) || "";
      //Removes comment from statement so that it isn't misparsed later
      data.statement = content.substr(0, content.indexOf("/"));
    }

    //Calculates number of dice to roll.
    data.d = Number(/^\d+/.exec(content)); //Number must immediately follow !, can be many digits.
    if (data.d > 10) {
      data.d = 10;
      data.comment +=
        "\nI'm limited to rolling 10 dice, drawing 10 minor arcana cards, drawing 10 major arcana cards, or conjuring 10 Wyld Magic Complications at a time.";
    }

    // default type
    type = "&type=Action";

    //Resist checker
    if (data.statement.toLowerCase().includes("r")) {
      rollType = "**Resistance** Roll: ";
      type = "&type=Resistance";
      data.resist = true;
    }

    //Gather Information Roll checker
    if (data.statement.toLowerCase().includes("g")) {
      rollType = "**Gather Information** Roll: ";
      type = "&type=Gather_Information";
      data.gather = true;
    }

    //Fortune Roll checker
    if (data.statement.toLowerCase().includes("f")) {
      rollType = "**Fortune** Roll: ";
      type = "&type=Fortune";
      data.fortune = true;
    }

    //Engagement Roll checker
    if (data.statement.toLowerCase().includes("e")) {
      rollType = "**Engagement** Roll: ";
      type = "&type=Engagement";
      data.engagement = true;
    }

    //Wyld Magic Action checker
    if (data.statement.toLowerCase().includes("w")) {
      rollType = "**Wyld Magic** Roll: ";
      type = "&type=Wyld_Magic";
      data.wyldmagic = true;
    }

    //Drawing Down the Moon checker
    if (data.statement.toLowerCase().includes("ddtm")) {
      rollType = "**Drawing Down the Moon** Roll: ";
      type = "&type=Drawing_Down_the_Moon";
      data.ddtm = true;
    }

    //Minor Arcana checker
    if (data.statement.toLowerCase().includes("minor")) {
      data.minor = true;
    }

    //Major Arcana checker
    if (data.statement.toLowerCase().includes("major")) {
      data.major = true;
    }

    //Wyld Magic Complications checker
    if (data.statement.toLowerCase().includes("wyld")) {
      data.wyldcomp = true;
    }

    if (!data.minor && !data.major && !data.wyldcomp) {
      // add 0d_ into type when user input 0 dice
      if (data.d == 0) {
        type = type.slice(0, 6) + "0d_" + type.slice(6);
      }
      data.dice = data.d || 2; //Handles 0d rolls for actions and resist.
    } else {
      data.dice = data.d; //Handles draws & wyld magic complications.
    }

    // Handles sounds in Discord Voice Channel
    if (soundtoggle) {
      if (!data.minor && !data.major && !data.wyldcomp) {
        if (!!voiceChan) {
          voiceChan.join().then(connection => {
            var oneortwo = data.d == 1 ? "one" : "two";
            var random1to6 = Math.floor(Math.random() * 6 + 1);
            var filename = "./audio_files/" + oneortwo + "_" + random1to6 + ".mp3";
            const dispatcher = connection.play(filename);
            dispatcher.on("end", end => voiceChan.leave());
          }).catch(err => console.log(err));
        }
      }
    }

    return this.roller(data);
  },

  //Generates random data
  async roller(data) {
    // Rolling dice into data.rolls[]
    data.rolls = [];
    data.index = 0;
    data.result = 0;

    // roll the dice
    for (let i = 1; i <= data.dice; i++) {
      const rollValue = await cryptoRand(1, 6);
      data.rolls.push(rollValue);
    }

    dice_types = "d=Xd6@";

    if (data.d === 0) {
      dice_types = dice_types.replace('X', 2);
      // Generate dice info for url
      for (var i = 0; i < data.rolls.length; i++) {
        var item = data.rolls[i].toString().replace(/\*/g, "");

        if (i == data.rolls.length - 1) {
          dice_types += item;
        } else {
          dice_types += item + "%20";
        }
      }

      // generate URL link for dice rolls only
      if (!data.wyldcomp && !data.major && !data.minor && !data.draw && !data.draw && linktoggle) {
        complete_url = "[🎲Link](" + url_start + dice_types + user + type + url_end + ")";
      } else {
        complete_url = "";
      }

      return this.zeroHandle(data); // Roll 2d, take lowest
    } else {
      dice_types = dice_types.replace('X', data.d);
      // Generate dice info for url
      for (var i = 0; i < data.rolls.length; i++) {
        var item = data.rolls[i].toString().replace(/\*/g, "");

        if (i == data.rolls.length - 1) {
          dice_types += item;
        } else {
          dice_types += item + "%20";
        }
      }

      // generate URL link for dice rolls only
      if (!data.wyldcomp && !data.major && !data.minor && !data.draw && linktoggle) {
        complete_url = "[🎲Link](" + url_start + dice_types + user + type + url_end + ")";
      } else {
        complete_url = "";
      }

      return this.manyHandle(data); // Take highest of data.rolls
    }
  },

  //Handling 0d rolls (roll 2, take lowest)
  zeroHandle(data) {
    if (data.rolls[0] > data.rolls[1]) {
      data.result = data.rolls[1];
      data.rolls[1] = `**${data.result}**`;
    } else {
      data.result = data.rolls[0];
      data.rolls[0] = `**${data.result}**`;
    }

    return this.commenter(data);
  },

  //Default roll handler
  manyHandle(data) {
    data.rolls.forEach((value, index) => {
      if (value > data.result) {
        //Stores highest roll + the index of it.
        data.result = value;
        data.index = index;
      } else if (value === 6 && data.result === 6) {
        //Bolds duplicate 6s if they exist (crit handling).
        data.rolls[index] = "**6**";
        data.crit = true;
      }
    });
    data.rolls[data.index] = `**${data.result}**`; //Bolds the first occurence of highest roll.

    return this.commenter(data);
  },

  //Formatting reply string.
  async commenter(data) {
    // add url and results to repsonse
    let replyString = ` {**${data.result}**} `;

    if (data.d !== 1) {
      replyString += `from ${data.rolls.join(", ")}`; //Doesn't display roll array if 1d.
    }

    if (data.comment) {
      replyString += data.comment;
    }

    //Display minor arcana draws
    let carddisplay = 0;
    let wylddisplay = 0;
    if (data.minor) {
      //Reset the array
      data.minorsuits = [];
      data.minorvalues = [];
      data.num = [];

      // draw random minor arcana
      for (let i = 0; i < data.dice; i++) {
        let newMinorSuit = 0;
        let newMinorValue = 0;

        const rndMinorValueNum = await cryptoRand(0, minor_values.length - 1);
        const rndMinorSuitIndex = await cryptoRand(0, minor_suits.length - 1);
        newMinorSuit = minor_suits[rndMinorSuitIndex];
        newMinorValue = minor_values[rndMinorValueNum];
        data.num.push(rndMinorValueNum);

        data.minorsuits.push(newMinorSuit);
        data.minorvalues.push(newMinorValue);
      }

      if (data.dice == 0) {
        return ` Drew precisely **0 Minor Arcana** cards, as requested.\n${data.comment}`;
      } else {
        carddisplay = ` Drew **${data.dice} Minor Arcana** card(s):\n`;
        for (let i = 0; i < data.dice; i++) {
          carddisplay += `${i + 1}: **${data.minorvalues[i]} of ${data.minorsuits[i]}**\n`;
        }
      }
      return `${carddisplay}${data.comment}`;
      //Display major arcana draws
    } else if (data.major) {
      //Reset the array
      data.majorvalues = [];
      data.num = [];

      // draw random major arcana
      for (let i = 0; i < data.dice; i++) {
        let newMajorValue = 0;

        const rndMajorValueNum = await cryptoRand(0, major_values.length - 1);
        newMajorValue = major_values[rndMajorValueNum];
        data.num.push(rndMajorValueNum);

        data.majorvalues.push(newMajorValue);
      }

      if (data.dice == 0) {
        return ` Drew precisely **0 Major Arcana** cards, as requested.\n${data.comment}`;
      } else {
        carddisplay = ` Drew **${data.dice} Major Arcana** card(s):\n`;
        for (let i = 0; i < data.dice; i++) {
          carddisplay += `${i + 1}: **${data.majorvalues[i]}**\n`;
        }
      }
      return `${carddisplay}${data.comment}`;
      //Display Wyld Magic Complications
    } else if (data.wyldcomp) {
      //Reset the array
      data.minorsuits = [];
      data.minorvalues = [];
      data.num = [];

      // draw random minor arcana (Wyld uses minors)
      for (let i = 0; i < data.dice; i++) {
        let newMinorSuit = 0;
        let newMinorValue = 0;

        const rndMinorValueNum = await cryptoRand(0, minor_values.length - 1);
        const rndMinorSuitIndex = await cryptoRand(0, minor_suits.length - 1);
        newMinorSuit = minor_suits[rndMinorSuitIndex];
        newMinorValue = minor_values[rndMinorValueNum];
        data.num.push(rndMinorValueNum);

        data.minorsuits.push(newMinorSuit);
        data.minorvalues.push(newMinorValue);
      }

      if (data.dice == 0) {
        return ` Conjured precisely **0 Wyld Magic Complications**, as requested.\n${data.comment}`;
      } else {
        wylddisplay = ` Conjured **${data.dice} Wyld Magic Complication(s)**:\n`;
        for (let i = 0; i < data.dice; i++) {
          let wyldtext = `${i + 1}: **${data.minorvalues[i]} of ${data.minorsuits[i]}**: ${wm_effects[data.num[i]]}\n`;

          let intrandomresult = (Math.floor(Math.random() * 2 + 1)); //randomresultsign of 1 or 2
          let randomresultsign = intrandomresult === 1 ? "-" : "+";

          let intrandompart = (Math.floor(Math.random() * 6 + 1)); //randomresultsign of 1 to 6
          let randombodypart = "";
          switch (intrandompart) {
            case 1:
            case 2:
              randombodypart = "arms shapeshift";
              break;
            case 3:
            case 4:
              randombodypart = "legs shapeshift";
              break;
            case 5:
              randombodypart = "torso shapeshifts";
              break;
            case 6:
              randombodypart = "head shapeshifts";
              break;
          }

          let randomnum1to3 = (Math.floor(Math.random() * 3 + 1)).toString();
          let randomresult = '' + randomresultsign + randomnum1to3;

          wyldtext = wyldtext.replace("randomresult", randomresult);
          wyldtext = wyldtext.replace("randombodypart", randombodypart);

          wylddisplay += wyldtext;
        }
      }
      return `${wylddisplay}${data.comment}`;
    } else if (data.resist) {
      //Resistance rolls
      if (data.crit) {
        return ` <span class="math-inline">\{rollType\}\*\*Critical\!\*\* You reduce or resist the effect and \*\*Recover 1 Willpower\!\*\*\\n</span>{replyString}`;
      } else {
        switch (true) {
          case data.result === 6:
            return ` <span class="math-inline">\{rollType\}\*\*Success\!\*\* You reduce or resist the effect and \*\*Spend no Willpower\!\*\*\\n</span>{replyString}`;
          case data.result >= 4:
            return ` ${rollType}You reduce or resist the effect and **Spend 1 Willpower!**\n${replyString}`;
          case data.result <= 3:
            return ` ${rollType}You reduce or resist the effect and **Spend 3 Willpower!**\n${replyString}`;
        }
      }
    } else if (data.gather) {
      //Gather Information rolls
      if (data.crit) {
        return ` ${rollType}**Critical!** Exceptional details. This info is complete and more details may be revealed than you hoped for without prompting!\n${replyString}`;
      } else {
        switch (true) {
          case data.result === 6:
            return ` ${rollType}**Great!** Good details. This info is complete and follow-up questions may reveal more info than you hoped for!\n${replyString}`;
          case data.result >= 4:
            return ` ${rollType}**Standard.** You get good details. Clarifying / follow-up questions are possible.\n${replyString}`;
          case data.result <= 3:
            return ` ${rollType}**Limited.** You get incomplete or partial information.\n${replyString}`;
        }
      }
    } else if (data.fortune) {
      //Fortune rolls
      if (data.crit) {
        return ` ${rollType}**Exceptional result!** Great, extreme effect or 5 ticks!\n${replyString}`;
      } else {
        switch (true) {
          case data.result === 6:
            return ` ${rollType}**Good result!** Standard, full effect or 3 ticks!\n${replyString}`;
          case data.result >= 4:
            return ` ${rollType}**Mixed result.** Limited, partial effect or 2 ticks.\n${replyString}`;
          case data.result <= 3:
            return ` ${rollType}**Bad result.** Poor, little effect or 1 tick.\n${replyString}`;
        }
      }
    } else if (data.ddtm) {
      //Drawing Down the Moon
      var ddtmtext = ` ${rollType}This ritual binds all members of the coven together and grounds all spellwork used during the recent Undertaking (including Wyld Magic).`;
      if (data.crit) {
        return ` ${ddtmtext}\n**Exceptional result!** Restore all Essence and 5 Willpower to each member!\n${replyString}`;
      } else {
        switch (true) {
          case data.result === 6:
            return ` ${ddtmtext}\n**Great result!** Restore 6 Essence and 3 Willpower to each member!\n${replyString}`;
          case data.result >= 4:
            return ` ${ddtmtext}\n**Good result!** Restore 4 Essence and 2 Willpower to each member!\n${replyString}`;
          case data.result <= 3:
            return ` ${ddtmtext}\n**Poor result.** Restore 2 Essence and 1 Willpower to each member!\n${replyString}`;
        }
      }
    } else if (data.engagement) {
      //Engagement
      if (data.crit) {
        return ` ${rollType}**Exceptional result!** The coven overcomes first obstacle and encouters the second obstacle from a Controlled position!\n${replyString}`;
      } else {
        switch (true) {
          case data.result === 6:
            return ` ${rollType}**Good result!** The coven encounters the first obstacle from a **Controlled** position!\n${replyString}`;
          case data.result >= 4:
            return ` ${rollType}**Mixed result.** The coven encounters the first obstacle from a **Risky** position.\n${replyString}`;
          case data.result <= 3:
            return ` ${rollType}**Bad result.** The coven encounters the first obstacle from a **Desperate** position.\n${replyString}`;
        }
      }
    } else if (data.wyldmagic) {
      //Wyld Magic rolls
      if (data.crit) {
        return ` ${rollType}**Critical Success!** You do it with increased effect!\n${replyString}`;
      } else {
        switch (true) {
          case data.result === 6:
            return ` ${rollType}**Complete Success!** You do it!\n${replyString}`;
          case data.result >= 4:
            return ` ${rollType}**Partial Success!** You do it with a Wyld Magic Complication.\n${replyString}`;
          case data.result <= 3:
            return ` ${rollType}**Failure!** The effect fails and a Wyld Magic Complication occurs instead.\n${replyString}`;
        }
      }
    } else {
      //Action rolls
      rollType = "**Action** Roll: ";
      switch (true) {
        case data.crit:
          return ` ${rollType}**Critical Success!** You do it with increased effect!\n${replyString}`;
        case data.result === 6:
          return ` ${rollType}**Complete Success!** You do it!\n${replyString}`;
        case data.result >= 4:
          return ` ${rollType}**Partial Success!** You do it at a cost.\n${replyString}`;
        case data.result <= 3:
          return ` ${rollType}**Failure!**\n${replyString}`;
      }
    }
  },
};

bot.on("message", async (msg) => {
  if (msg.member != null) {
    voiceChan = msg.member.voice.channel;
    user = "&user=" + msg.author.username.replace(/ /g, "_");
  }

  const request = msg.content;
  const userName = msg.author.username;
  const channelName = msg.channel.name;

  try {
    if (msg.content.length > prefix.length && msg.content.slice(0, prefix.length) === prefix) {
      let content = msg.content.slice(prefix.length);

      if (obj[content]) {
        msg.reply(obj[content]).catch((error) => {
          console.log(error);
          msg.reply(
            "The bot had an error, which has been logged.\n*" +
            error.message +
            "*"
          );
        });
      } else if (!isNaN(content[0])) {
        let reply = await roll.parse(content);

        if (!spoilertoggle) {
          var roller_embed = new Discord.MessageEmbed()
            .setDescription(complete_url + reply);
        } else {
          var roller_embed = new Discord.MessageEmbed()
            .setDescription(complete_url + " ||" + reply + "||");
        }

        msg.channel.send(roller_embed)
          .catch((error) => {
            console.log(error);
            msg.reply(
              "The bot had an error, which has been logged.\n*" +
              error.message +
              "*"
            );
          });

        // Output request and response
        console.log(`User: ${userName}`);
        console.log(`Channel: ${channelName}`);
        console.log(`Request: ${request}`);
        console.log(`Response: ${reply}`);
        console.log("---");
      }
    }
  } catch (error) {
    // Output error
    console.log(`User: ${userName}`);
    console.log(`Channel: ${channelName}`);
    console.log(`Request: ${request}`);
    console.log(`Error: ${error.message}`);
    console.log("---");

    msg.reply(`An error occurred: ${error.message}`);
  }

  if (msg.content === "!diagnostic") {
    try {
      // Run one of each type of user function
      const diagnosticTests = [
        "!0",        // Action roll 0d
        "!3",        // Action roll 3d
        "!2r",       // Resistance roll
        "!3g",       // Gather Information roll
        "!2f",       // Fortune roll
        "!4e",       // Engagement roll
        "!2w",       // Wyld Magic roll
        "!3ddtm",    // Drawing Down the Moon roll
        "!2minor",   // Minor Arcana draw
        "!2major",   // Major Arcana draw
        "!2wyld",    // Wyld Magic Complications draw
      ];

      let diagnosticOutput = "Running diagnostic tests:\n";

      for (const testCommand of diagnosticTests) {
        const reply = await roll.parse(testCommand.slice(1)); // Remove "!"
        diagnosticOutput += `> ${testCommand}: ${reply}\n`;
      }

      // Send the diagnostic output
      msg.channel.send(diagnosticOutput);

      // Log the diagnostic output to the console for the developer
      console.log("Diagnostic test results:");
      console.log(diagnosticOutput);
    } catch (error) {
      console.error("Diagnostic test error:", error);
      msg.channel.send("Diagnostic test failed. Check the console for details.");
    }
    return;
  }
});

bot.login(process.env['CLIENT_TOKEN']);