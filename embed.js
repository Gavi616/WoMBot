const Discord = require("discord.js");

module.exports.help = new Discord.MessageEmbed()
	.setColor("#0099ff")
	.setTitle("Help")
	.setDescription(
		`Hey, I'm WoMbot. Use the following syntax to interact with me:`
	)
	.addFields(
		{
			name: `You say...`,
			inline: true,
			value: `\` !2 \`
		\` !3r \`
    \` !2f \`
    \` !4g \`
    \` !2e \`
    \` !4w \`
    \` !1major \`
    \` !3minor \`
    \` !1wyld \`
    \` !1ddtm \`
    \` /comment \``,
		},
		{
			name: `To...`,
			inline: true,
			value: `Action roll of d6s.
		Resistance roll of d6s.
    Fortune roll of d6s.
    Gather Information roll of d6s.
    Engagement roll of d6s.
    Wyld Magic roll of d6s.
    Draws Major Arcana cards.
    Draws Minor Arcana cards.
    Random Wyld Magic Complications.
    *Drawing Down the Moon* ritual roll.
    Add comment to a roll, draw, etc.`,
		},
		{
			name: `Show this message again:`,
			value: `\` !help \` `,
		},
		{
			name: `Basic mechanics...`,
			value: `\` !dice \`
		\` !position or !effect \`
		\` !group \`
    \` !downtime \``,
			inline: true,
		},
		{
			inline: true,
			name: `For info...`,
			value: `Lists how to get extra dice.
		Explains position & effect.
		Explains Group Actions.
    Lists all Downtime activities.`,
		},
		{
			name: `Bargain suggestions:`,
			value: `\` !bargain \``,
		},
		{
			inline: true,
			name: `Consequence reference...`,
			value: `\` !controlled \`
		\` !risky \`
		\` !desperate \``,
		},
		{
			inline: true,
			name: `Lists...`,
			value: `Controlled consequences
		Risky consequences
		Desperate consequences`,
		},
    {
      name: `Additionally...`,
			value: `If you are connected to a voice channel, dice sounds will play.`
    }
	);

module.exports.position = new Discord.MessageEmbed()
	.setColor("#0099ff")
	.setTitle("What's your Position & Effect?")
	.setDescription(
		`Position and Effect are important to discuss with your GM. 
	They can be thought of as 'risk' versus 'reward'; they describe how rewarding success will be, and the consequences you're risking.`
	)
	.addFields(
		{
			name: `Position...`,
			inline: true,
			value: `Controlled
		Risky
		Desperate`,
		},
		{
			name: `Effect...`,
			inline: true,
			value: `Great
		Standard
		Limited
		`,
		}
	);

module.exports.effect = module.exports.position;

module.exports.dice = new Discord.MessageEmbed()
	.setColor("#0099ff")
	.setTitle("Want extra dice?")
	.setDescription(
		`You can gain extra dice for your roll. Push yourself, ask covenmates for an assist or ask the GM for a Bargain... Or you can ask me about Group Actions with !group`
	)
	.addFields(
		{
			name: `Gain dice by...`,
			inline: true,
			value: `Pushing Yourself
		Assists
		Fae Bargain`,
		},
		{
			name: `At the cost of...`,
			inline: true,
			value: `Spend two Willpower
		Spend one Willpower
		Ask your GM for details`,
		}
	);

module.exports.group = new Discord.MessageEmbed()
	.setColor("#0099ff")
	.setTitle("Group Actions")
	.setDescription(
		`Teamwork is important! Pick a covenmate to lead your group action. Anyone who wants to partake in the action can roll, and the highest result counts for the entire group! Anyone who fails (1-3) makes the leader spend 1 willpower`
	)
	.addFields({
		name: `A word of caution...`,
		value: `If the group action results in consequences, the entire group may suffer consequences.`,
	});

module.exports.downtime = new Discord.MessageEmbed()
	.setColor("#0099ff")
	.setTitle("Downtime Activities")
	.setDescription(
		`Each Downtime activity can be used multiple times except Training (once per type). Gain +1d if you get assistance from a contact. Consume Fae Fruits to gain additional Downtime actions.`
	)
	.addFields(
		{
			name: `Downtime activity...`,
			inline: true,
			value: `Acquire an Asset
      Cast a Greater Ritual
      Crafting
      Perform Service
      Recovery
      Restore Essence
      Restore Willpower
      Long Term Project
      Training`,
		},
		{
			name: `Description...`,
			inline: true,
			value: `Gain temporary use of personal gear or a coven asset
		  Cast powerful ceremonial magic with your coven
		  Craft a useful Charm -or- powerful Arcanum
      Tend to the local fae -or- your community's needs
      Heal your mental and physical wounds
      Connect to restore your spiritual battery
      Seek support to stabilize your mental health
      Start and/or work on a long-term project
      Learn new powers or enhance your abilities`,
		}
	);

module.exports.controlled = new Discord.MessageEmbed()
	.setColor("#0099ff")
	.setTitle("Controlled Consequences")
	.setDescription(
		`Don't worry, you can always resist consequences to lower the severity of them!`
	)
	.addFields(
		{
			name: `Stop!`,
			value: `Reduced Effect:
		Worse Position:
		Lost Opportunity:
		Complication:
		Harm:`,
			inline: true,
		},
		{
			name: `You violated the law!`,
			value: `-1 effect level
			-1 position (can try again if failure)
			Try again with a new action rating.
			Immediate problem, 1 tick or +1 Fate.
			Lesser Harm`,
			inline: true,
		}
	);

module.exports.risky = new Discord.MessageEmbed()
	.setColor("#0099ff")
	.setTitle("Risky Consequences")
	.setDescription(
		`Don't worry, you can always resist consequences to lower the severity of them!`
	)
	.addFields(
		{
			name: `Stop right there,`,
			value: `Reduced Effect:
		Worse Position:
		Lost Opportunity:
		Complication:
		Harm:`,
			inline: true,
		},
		{
			name: `criminal scum!`,
			value: `-1 effect level
		-1 position (try again if fail)
		Try again with a new action
		Immediate problem, 2 ticks or +1 Fate
		Moderate Harm`,
			inline: true,
		}
	);

module.exports.desperate = new Discord.MessageEmbed()
	.setColor("#0099ff")
	.setTitle("Desperate Consequences")
	.setDescription(
		`Don't worry, you can always resist consequences to lower the severity of them!`
	)
	.addFields(
		{
			name: `Then pay`,
			value: `Reduced Effect:
		Worse Position:
		Lost Opportunity:
		Complication:
		Harm:`,
			inline: true,
		},
		{
			name: `with your blood!`,
			value: `-1 effect level
		-1 position (try again if fail)
		Try again with a new action
		Severe problem, 3 ticks or +2 Fate
		Greater or Fatal Harm`,
			inline: true,
		}
	);

module.exports.bargain = new Discord.MessageEmbed()
	.setColor("#0099ff")
	.setTitle(`Bargains`)
	.setDescription(`Can be proposed by LW or other player. +1d for accepting.`)
	.addFields({
		name: `Some suggested Bargains`,
		value: `- Collateral damage, unintended harm
	- Damage, Sacrifice or Lose an item (even if momentarily)
	- Appear to betray a friend or loved one
	- Offend or anger a faction
	- Start and/or tick a troublesome clock
	- Add Fate to the coven from evidence or witnesses
	- Suffer Harm
	- ...or another devious or mischevious complication`,
	});
