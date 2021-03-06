const path = require('path');
const intLang = require(path.join(__dirname, '../..', 'locale', 'language'));
const {discord} = require(path.join(__dirname, '../..', 'config', 'config'));
const {dumpEvent} = require(path.join(__dirname, '../..', 'utilities', 'dumpEvent'));
const {messageEmbedSend} = require(path.join(__dirname, '../..', 'utilities', 'utilities'));

// Command Module
module.exports = {
    name: 'staffhelp',
    description: 'Displays list of commands available to Staff.',
    allowDisable: false,
    staffOnly: true,
    hide: true,
    aliases: ['shelp'],
    cooldown: 120,
    execute(client, message) {

        // Command List
        const commandList = client.commands.reduce((accumulator, command) => {
            if (command.staffOnly) accumulator.push(`**\`${discord.prefix}${command.name}${command.usage ? ` ${command.usage}` : ''}\`** ${command.aliases ? `or **\`${discord.prefix}${command.aliases}\`**`:''}\n${command.description}\n\n`);
            return accumulator;
        }, []);

        // Message Embed Response
        messageEmbedSend(client, message.channel, true, intLang('commands.staffCommands.embedMessage.title', client.user.username), intLang('commands.staffCommands.embedMessage.description', commandList.join(' '), discord.prefix));
        dumpEvent.dumpCommand(client, message, 'yellow', this.name);
    }
};
