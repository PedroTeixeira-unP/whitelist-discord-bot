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
const { EmbedBuilder } = require("discord.js");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

dotenv.config();

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  //Terminal message to let us know the code running fine
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
    case "test":
      runCommand(interaction);
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
    timestamp: new Date().toISOString(),
  };

  client.channels.cache
    .get(process.env.guildid_message)
    .send({ embeds: [exampleEmbed] });

  // Add Reaction
  // client.channels.cache.get(guildID).send({ embeds: [exampleEmbed] }).then((sent) => {
  //     sent.react('✅');
  //   });
}

// Logs message sended after submition
function sendLog(user, answers) {
  // inside a command, event listener, etc.
  const exampleEmbed = {
    color: 0x0099ff,
    title: ":1658partnerwaitapproval: Usuário aguardando sua aprovação!",
    url: "https://discord.js.org",
    author: {
      name: "Nova aplicação de whitelist",
      icon_url:
        "https://media.discordapp.net/attachments/1062661432031854602/1062732029361389608/logo-simple.png?width=1179&height=663",
    },
    description: `Utilizador <@${user.id}>`,
    thumbnail: {
      url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`,
    },
    fields: answers,
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

// Run command from other bot
function runCommand(interaction) {
  // Extract the 'nomedomembro' parameter from the interaction
  const member = interaction.options.getUser("user");
  if (!member) {
    interaction.reply({ content: "No user specified.", ephemeral: true });
    return;
  }

  // The command for the other bot, including the member's username or ID
  const commandForOtherBot = `/aprovar ${member.username}`; // or member.id, depending on how the other bot recognizes users

  // The channel where you want to send the command
  // This should be a channel where the other bot is listening for commands
  const channelId = process.env.GUILDID_LOGS;

  // Fetch the channel from the client
  const channel = client.channels.cache.get(channelId);

  if (!channel) {
    console.error("Command channel not found");
    return;
  }

  // Send the command message to the channel
  channel
    .send(commandForOtherBot)
    .then(() => {
      interaction.reply({
        content: "Command sent to the other bot.",
        ephemeral: true,
      });
    })
    .catch((error) => {
      console.error("Error sending command to the other bot:", error);
      interaction.reply({
        content: "Failed to send command to the other bot.",
        ephemeral: true,
      });
    });
}
