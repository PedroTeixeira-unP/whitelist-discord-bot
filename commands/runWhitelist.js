const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("run whitelist!"),
};
