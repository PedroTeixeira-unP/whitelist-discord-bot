const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test!")
    .addUserOption(
      (option) =>
        option.setName("user").setDescription("Select a user").setRequired(true) // Set to false if the user parameter should be optional
    ),
};
