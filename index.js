// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require("discord.js");
const dotenv = require("dotenv");
const {
  ActionRowBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { fields } = require("./options.json");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

dotenv.config();

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Set Menu configuration
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case "whitelist":
      // Create the modal
      const modal = new ModalBuilder()
        .setCustomId("whitelist")
        .setTitle("Formulário de Whitelist");

      // Add components to modal
      for (const file of fields) {
        const component = new TextInputBuilder()
          .setCustomId(file.id)
          .setLabel(file.label)
          .setStyle(
            file.style === "short"
              ? TextInputStyle.Short
              : TextInputStyle.Paragraph
          );

        const action = new ActionRowBuilder().addComponents(component);
        modal.addComponents(action);
      }

      // Show the modal to the user
      await interaction.showModal(modal);
      break;
    case "command":
      whitelistMessage();
      break;
    default:
      break;
  }
});

//retrieve data from submition
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "whitelist") {
    await interaction.reply({
      content: "A tua whitelist foi enviada com sucesso!",
      ephemeral: true,
    });

    const user = interaction.user;
    const answers = [];

    // Get the data entered by the user
    for (const file of fields) {
      const input = interaction.fields.getTextInputValue(file.id);
      answers.push({ name: file.label, value: input });
    }

    sendLog(user, answers);
  }
});

// Log in to Discord with your client's token
client.login(process.env.token);

function whitelistMessage() {
  const exampleEmbed = {
    color: 0x0099ff,
    fields: [
      {
        name: "",
        value: "```🔔 WHITELIST```",
      },
      {
        name: "",
        value:
          "Você pode fazer nossa **Whitelist** a qualquer momento e quantas vezes quiser, o resultado será enviado no seu **DM** assim que sua **WHITELIST** for revisada.",
      },
      {
        name: "",
        value: "```❗ ATENÇÃO```",
      },
      {
        name: "",
        value: "para realizar sua **Whitelist** use o comando **/whitelist**",
      },
    ],
    image: {
      url: "https://media.discordapp.net/attachments/1062661432031854602/1067234861116559360/WHITELIST.png",
    },
    footer: {
      text: "Sistema de whitelist.",
      icon_url:
        "https://media.discordapp.net/attachments/1062661432031854602/1062732029361389608/logo-simple.png?width=1179&height=663",
    },
  };

  client.channels.cache
    .get(process.env.guildid_message)
    .send({ embeds: [exampleEmbed] });
}

function sendLog(user, answers) {
  const exampleEmbed = {
    color: 0x0099ff,
    title: "Usuário aguardando sua aprovação!",
    url: "https://discord.js.org",
    author: {
      name: "Nova aplicação de whitelist",
      icon_url:
        "https://media.discordapp.net/attachments/1062661432031854602/1062732029361389608/logo-simple.png?width=1179&height=663",
    },
    thumbnail: {
      url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`,
    },
    fields: [
      ...answers,
      {
        name: "Utilizador",
        value: `<@${user.id}>`, // This will create a mention of the user
        inline: false,
      },
    ],
    footer: {
      text: "Sistema de whitelist.",
      icon_url:
        "https://media.discordapp.net/attachments/1062661432031854602/1062732029361389608/logo-simple.png?width=1179&height=663",
    },
    timestamp: new Date().toISOString(),
  };

  const messageContent = `Novo pedido de whitelist de <@${user.id}>`;

  client.channels.cache
    .get(process.env.guildid_logs)
    .send({ content: messageContent, embeds: [exampleEmbed] })
    .then((sentMessage) => {
      sentMessage.react("✅");
      sentMessage.react("❌");
    });
}

function accept(member) {
  member.roles.add(process.env.roleid);
}

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.message.channel.id === process.env.guildid_logs) {
    const mentions = reaction.message.mentions.users;

    if (reaction.emoji.name === "✅") {
      mentions.forEach(async (mentionedUser) => {
        try {
          const member = await reaction.message.guild.members.fetch(
            mentionedUser.id
          );
          await accept(member);
          await member.send("A tua aplicação para a whitelist foi aceite.");
          sendApprovalLog(user, mentionedUser);
        } catch (error) {
          console.error(`Error adding role to ${mentionedUser.tag}:`, error);
          return;
        }
      });
    } else if (reaction.emoji.name === "❌") {
      const member = await reaction.message.guild.members.fetch(
        mentionedUser.id
      );
      await member.send("A tua aplicação para a whitelist foi rejeitada.");
      mentions.forEach(async (mentionedUser) => {
        sendRejectLog(user, mentionedUser);
      });
    }

    await reaction.message.delete();
  }
});

function sendApprovalLog(user, member) {
  const exampleEmbed = {
    color: 0x0099ff,
    fields: [
      {
        name: "",
        value: `O utilizador <@${member.id}> foi aceite por: <@${user.id}> `,
      },
    ],
    footer: {
      text: "Sistema de whitelist.",
      icon_url:
        "https://media.discordapp.net/attachments/1062661432031854602/1062732029361389608/logo-simple.png?width=1179&height=663",
    },
    timestamp: new Date().toISOString(),
  };

  client.channels.cache
    .get(process.env.guildid_logs)
    .send({ embeds: [exampleEmbed] });
}

function sendRejectLog(user, member) {
  const exampleEmbed = {
    color: 0x0099ff,
    fields: [
      {
        name: "",
        value: `O utilizador <@${member.id}> foi rejeitada por: <@${user.id}> `,
      },
    ],
    footer: {
      text: "Sistema de whitelist.",
      icon_url:
        "https://media.discordapp.net/attachments/1062661432031854602/1062732029361389608/logo-simple.png?width=1179&height=663",
    },
    timestamp: new Date().toISOString(),
  };

  client.channels.cache
    .get(process.env.guildid_logs)
    .send({ embeds: [exampleEmbed] });
}
