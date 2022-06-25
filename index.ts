import DiscordJS, { Intents, MessageEmbed, Permissions, TextChannel, } from 'discord.js';
import type {Message} from 'discord.js';
import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { doc, setDoc, getFirestore, collection, getDocs } from "firebase/firestore";
import { getOrders } from './woocommerce';

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
const addressRef = collection(db, "addresses");

interface DataItem {
    discordUsername: string;
    email: string;
    walletAddress: string;
}

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
      
    ]
})

const prefix = '?';

client.on('ready', () => {
    console.log('Botty: I am online.')
})

client.on('messageCreate', (message) => {
    const command = message.content.split(' ');
    if(message.author.id != client.user?.id) {
        switch (command[0]) {
            case `${prefix}whitelist`:
                getWhitelist(message, command);
                break;
            case `${prefix}help`:
                getHelp(message);
                break;
            case `${prefix}list`:
                getList(message, command);
                break;
            case `${prefix}test`:
                testFunction(message);
                break;
            default:
                break;
        }
    }
})

client.login(process.env.TOKEN);

async function setValue(data: DataItem, authorId: string) {
    await setDoc(doc(db, "addresses", authorId), data);
}

function testFunction(message: Message) {
    getOrders();
    message.reply("Testing...");
}

function getWhitelist(message: Message, command: string[]) {
    if (message.member?.roles.cache.find(role => role.name.toLowerCase() == 'whitelist')) {
        if (command.length <= 1) {
            const commandEmbed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle('Enter your credentials')
                .setAuthor('Credentials','https://cdn.discordapp.com/attachments/909881951639437392/951144533670903849/Attachment_1646840820-1.jpeg')
                .setDescription(`<@${message.author.id}> Please Enter Your email and wallet address e.g. /whitelist user@memail.com 0x4523g35gg35g53`)
                .setImage('https://cdn.discordapp.com/attachments/909881951639437392/951144533670903849/Attachment_1646840820-1.jpeg')
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
                    .setImage('https://cdn.discordapp.com/attachments/908853989834129501/951176835889266718/red-error-round-icon-2.png')
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
}

function getHelp(message: Message) {
    const commandEmbed = new MessageEmbed()
        .setColor('RANDOM')
        .setTitle('Kindly use the provided format')
        .setAuthor('Whitelist','https://cdn.discordapp.com/attachments/909881951639437392/951144533670903849/Attachment_1646840820-1.jpeg')
        .setDescription('/whitelist user@memail.com 0x4523g35gg35g53')
        .setImage('https://cdn.discordapp.com/attachments/909881951639437392/951144533670903849/Attachment_1646840820-1.jpeg')
        .setTimestamp(new Date())
        .setFooter('I hope that helped');
    message.channel.send({
        embeds:[commandEmbed]
    });
}

function getList(message: Message, command: string[]) {
    if (message.member?.roles.cache.find(role => role.name.toLowerCase() == 'admin')) {
        try {
            getData(message, command[1]);
        } catch(err) {
            console.log(err);
        }
    } else {
        message.channel.send(`<@${message.author.id}>, This command can only be used by the Admin Role`);
    }
}

async function getData(message: DiscordJS.Message, listType:string){
    let data: any[] = [];
    let dataString: string = '';
    let index = 1;

    const snapshot = await getDocs(addressRef);
    snapshot.forEach((doc) => {
        data.push(doc.data());
    })
    switch (listType) {
        case 'all':
            data.forEach((dataItem) => {
                dataString += `${index}. **${dataItem.discordUsername}** => _${dataItem.email}_ => ${dataItem.walletAddress} \n`
                index++;
            })
            break;
        default:
            data.forEach((dataItem) => {
                dataString += `${index}. **${dataItem.discordUsername}**\n`
                index++;
            })
            break;
    }
    const commandEmbed = new MessageEmbed()
        .setColor('RANDOM')
        .setTitle('Submitted Details')
        .setDescription(dataString)
        .setTimestamp(new Date())
        .setFooter('#Noryoz');
    message.channel.send({
        embeds:[commandEmbed]
    });
}

function ValidateEmail(mail: string) {
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true);
  }
    return (false);
}