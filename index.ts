import DiscordJS, { Intents, MessageEmbed, Permissions, TextChannel, } from 'discord.js';
import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { doc, setDoc, getFirestore } from "firebase/firestore"; 

dotenv.config();

const firebaseConfig = {
    apiKey: "AIzaSyBFtfsivwmWIJQ_h8MJW9WgbF8Bkuejfpc",
    authDomain: "bottybotty.firebaseapp.com",
    projectId: "bottybotty",
    storageBucket: "bottybotty.appspot.com",
    messagingSenderId: "18943284273",
    appId: "1:18943284273:web:3010f95c36d468ded3f110"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore();

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
      
    ]
})

client.on('ready', () => {
    console.log('Botty: I am online.')
})

client.on('messageCreate', (message) => {
    const command = message.content.split(' ');
    if(message.author.id != client.user?.id) {
        if (command[0] == '/whitelist') {
            if (message.member?.roles.cache.find(role => role.name.toLowerCase() == 'whitelist')) {
                if (command.length <= 1) {
                    const commandEmbed = new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle('Enter your credentials')
                    .setAuthor('Credentials','https://cdn.discordapp.com/attachments/909881951639437392/951144533670903849/Attachment_1646840820-1.jpeg')
                    .setDescription(`<@${message.author.id}> Please Enter Your email and wallet address e.g. /whitelist user@memail.com 0x4523g35gg35g53`)
                    .setImage('https://cdn.discordapp.com/attachments/909881951639437392/951144533670903849/Attachment_1646840820-1.jpeg')
                    //.addField('Inline field title', 'Some value here', true)
                    .setTimestamp(new Date())
                    .setFooter('Kindly ensure your credentials are in correct format',)
                    message.channel.send({
                        embeds:[commandEmbed]
                    })
                } else {
                    if (ValidateEmail(command[1])) {
                        setValue({
                            discordUsername: message.author.username,
                            email: command[1],
                            walletAddress: command[2]
                        }, message.author.id)
                        const commandEmbed = new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle('Thank You!')
                    .setAuthor('Credentials','https://cdn.discordapp.com/attachments/909881951639437392/951144533670903849/Attachment_1646840820-1.jpeg')
                    .setDescription(`<@${message.author.id}> Your Address: ${command[2]} and email: ${command[1]} has been saved successfully.`)
                    .setImage('https://cdn.discordapp.com/attachments/908853989834129501/951176211000881162/Great-Job-Emoji-PNG-Photos.png')
                    //.addField('Inline field title', 'Some value here', true)
                    .setTimestamp(new Date())
                    .setFooter('Thank you for your time',)
                    message.author.send({
                        embeds:[commandEmbed]
                    })
                    message.channel.send(`<@${message.author.id}> Check Your DM`);
                    } else {
                        const commandEmbed = new MessageEmbed()
                        .setColor('RANDOM')
                        .setTitle(`<@${message.author.id}> Please enter a Valid Email!`)
                        .setAuthor('ERROR!','https://cdn.discordapp.com/attachments/909881951639437392/951144533670903849/Attachment_1646840820-1.jpeg')
                        //.setDescription(``)
                        .setImage('https://cdn.discordapp.com/attachments/908853989834129501/951176835889266718/red-error-round-icon-2.png')
                        //.addField('Inline field title', 'Some value here', true)
                        .setTimestamp(new Date())
                        .setFooter('KIndly check your email format!',)
                        message.author.send({
                            embeds:[commandEmbed]
                        })
                        message.channel.send(`<@${message.author.id}> Check Your DM`);
                    }
                }
                message.delete();
            } else {
                message.channel.send(`<@${message.author.id}> you do not have the Whitelist Role.`);
            }
        } else if(command[0] == '/help') {
            const commandEmbed = new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle('Kindly use the provided format')
                    .setAuthor('Whitelist','https://cdn.discordapp.com/attachments/909881951639437392/951144533670903849/Attachment_1646840820-1.jpeg')
                    .setDescription('/whitelist user@memail.com 0x4523g35gg35g53')
                    .setImage('https://cdn.discordapp.com/attachments/909881951639437392/951144533670903849/Attachment_1646840820-1.jpeg')
                    //.addField('Inline field title', 'Some value here', true)
                    .setTimestamp(new Date())
                    .setFooter('I hope that helped',)
                    message.channel.send({
                        embeds:[commandEmbed]
                    })
        } else if(command[0] == '/test') {
            console.log('test');
        }
    }
})

client.login(process.env.TOKEN);

async function setValue(data: {
    discordUsername: string;
    email: string;
    walletAddress: string;
}, authorId: string) {
    await setDoc(doc(db, "addresses", authorId), data);
}

function ValidateEmail(mail: string) {
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true);
  }
    return (false);
}