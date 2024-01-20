const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("version")
    .setDescription("Verify version of the bot!"),
};
