const path = require('path');
const logger = require(path.join(__dirname, '../..', 'config', 'logger'));
const intLang = require(path.join(__dirname, '../..', 'locale', 'language'));
const {discord} = require(path.join(__dirname, '../..', 'config', 'config'));
const {dumpEvent} = require(path.join(__dirname, '../..', 'utilities', 'dumpEvent'));
const {dbDisabledCommand} = require(path.join(__dirname, '../..', 'utilities', 'datastore'));

// Command Module
module.exports = {
    name: 'command',
    description: 'Enables or Disables a bot command.',
    allowDisable: false,
    arguments: true,
    managerOnly: true,
    hide: true,
    usage: '<disable/enable> <CommandName>',
    cooldown: 2,
    execute(client, message) {

        // Message Commands Parser
        const args = message.content.slice(discord.prefix.length).trim().split(/\s+/g);
        const option = args[1].toLowerCase();

        if (option !== 'enable' && option !== 'disable') return message.reply(intLang('commands.commandStatus._errors.firstOption', discord.prefix))
            .catch(() => logger.error(intLang('discord._errors.messageIneffective', message.channel.id)+ ' [0204]'));

        if (typeof args[2] === 'undefined') return message.reply(intLang('commands.commandStatus._errors.secondOption', discord.prefix))
            .catch(() => logger.error(intLang('discord._errors.messageIneffective', message.channel.id)+ ' [0205]'));

        const command = client.commands.get(args[2].toLowerCase());

        switch(option){
            case 'enable':
                
                // Command Query
                if (!command) return message.reply(intLang('events.message._errors.commandUnknown', discord.prefix))
                    .catch(() => logger.error(intLang('discord._errors.messageIneffective', message.channel.id)+ ' [0011]'));

                // Pre check if our command has already been enabled
                dbDisabledCommand.find({commandDisabled: command.name}, async (error, result) => {
                    if (error) return logger.error(intLang('nedb._errors.disableOrEnableFindIneffective', error)+ ' [0012]');
                    if (result.length === 0) return message.reply(intLang('commands.commandStatus.enable._errors.enableCommandAlreadyAdded', error))
                        .catch(() => logger.error(intLang('discord._errors.messageIneffective', message.channel.id)+ ' [0206]'));

                    // Remove the new disabled command if checks are valid
                    dbDisabledCommand.remove({commandDisabled: command.name}, { multi: true }, async error => {
                        if (error) return message.reply(intLang('nedb._errors.disableOrEnableRemoveIneffective', error))
                            .catch(() => logger.error(intLang('discord._errors.messageIneffective', message.channel.id)+ ' [0207]'));

                        message.react('✅')
                            .then(() => message.reply(intLang('commands.commandStatus.enable.success.enableCommandAdded', command.name))
                                .catch(() => logger.error(intLang('discord._errors.messageIneffective', message.channel.id)+ ' [0208]')))
                            .then(() => dumpEvent.dumpCommand(client, message, 'black', `${this.name} ${option} ${command.name}`))
                            .catch(() => logger.error(intLang('discord._errors.messageReactIneffective', message.channel.id)+ ' [0123]'));
                    });
                });
                break;

            case 'disable':

                // Command Query
                if (!command) return message.reply(intLang('events.message._errors.commandUnknown', discord.prefix))
                    .catch(() => logger.error(intLang('discord._errors.messageIneffective', message.channel.id)+ ' [0013]'));

                // Pre check if our command has already been disabled
                dbDisabledCommand.find({commandDisabled: command.name}, async (error, result) => {
                    if (error) return logger.error(intLang('nedb._errors.disableOrEnableFindIneffective', error)+ ' [0014]');
                    if (result.length > 0) return message.reply(intLang('commands.commandStatus.disable._errors.disableCommandAlreadyAdded', error))
                        .catch(() => logger.error(intLang('discord._errors.messageIneffective', message.channel.id)+ ' [0209]'));

                    // Insert the new disabled command if checks are valid
                    dbDisabledCommand.insert({commandDisabled: command.name}, async error => {
                        if (error) return logger.error(intLang('nedb._errors.disableOrEnableInsertIneffective', error)+ ' [0015]');
                        message.react('✅')
                            .then(() => message.reply(intLang('commands.commandStatus.disable.success.disableCommandAdded', command.name))
                                .catch(() => logger.error(intLang('discord._errors.messageIneffective', message.channel.id)+ ' [0210]')))
                            .then(() => dumpEvent.dumpCommand(client, message, 'black', `${this.name} ${option} ${command.name}`))
                            .catch(() => logger.error(intLang('discord._errors.messageReactIneffective', message.channel.id)+ ' [0124]'));
                    });
                });
                break;
        }
    }
};
