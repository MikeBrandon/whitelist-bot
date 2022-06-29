import DiscordJS, { Intents, MessageEmbed, Permissions, TextChannel, } from 'discord.js';
import type {Message} from 'discord.js';
import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { doc, setDoc, getFirestore, collection, getDocs } from "firebase/firestore";
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

dotenv.config();

const firebaseConfig = {
    apiKey: "AIzaSyBFtfsivwmWIJQ_h8MJW9WgbF8Bkuejfpc",
    authDomain: "bottybotty.firebaseapp.com",
    projectId: "bottybotty",
    storageBucket: "bottybotty.appspot.com",
    messagingSenderId: "18943284273",
    appId: "1:18943284273:web:3010f95c36d468ded3f110"
};

const WooCommerce = new WooCommerceRestApi({
    url: 'https://sportstemplates.net',
    consumerKey: 'ck_e0fd19c1f911c57a765bb45f1c0042e5492b7397',
    consumerSecret: 'cs_e82c4e66a80570488470d9481261096a9faf07a9',
    version: 'wc/v3'
});

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const addressRef = collection(db, "addresses");

interface DataItem {
    discordUsername: string;
    email: string;
    walletAddress: string;
}

interface Order {
    discordUsername: string;
    email: string;
    orderNumber: string;
}

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
      
    ]
})

const prefix = '?';

let orders: Order[] = [];

client.on('ready', () => {
    console.log('Botty: I am online.')
})

client.on('messageCreate', (message) => {
    const command = message.content.split(' ');
    if(message.author.id != client.user?.id) {
        switch (command[0]) {
            case `${prefix}whitelist`:
                runFunction(postWhitelist(message, command), command);
                break;
            case `${prefix}help`:
                runFunction(getHelp(message), command);
                break;
            case `${prefix}list`:
                runFunction(getList(message, command), command);
                break;
            case `${prefix}verify-purchase`:
                runFunction(verifyPurchase(message, command), command);
                break;
            default:
                break;
        }
    }
})

client.login(process.env.TOKEN);

function runFunction(func: void | Promise<void>, command :string[]) {
    console.log("Command: ", command.join())
    func;
}

async function setValue(data: DataItem, authorId: string) {
    await setDoc(doc(db, "addresses", authorId), data);
}

async function verifyPurchase(message: Message, command: string[]) {
    let newOrder: Order = {
        discordUsername: message.author.id,
        email: command[1],
        orderNumber: command[2]
    };

    if (command.length <= 1) {
        const commandEmbed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle('Enter your Order Details')
                .setAuthor('Credentials','https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                .setDescription(`<@${message.author.id}> Please Enter Your email and Order Number e.g. ?verify-purchase user@memail.com 457345`)
                .setImage('https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                .setTimestamp(new Date())
                .setFooter('Kindly ensure your credentials are in correct format',)
            message.channel.send({
                embeds:[commandEmbed]
            })
            return;
    }

    let currentUser = orders.find(o => o.orderNumber === newOrder.orderNumber)?.discordUsername;
    if (currentUser) {
        const commandEmbed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle('Order Number Already In Use')
                .setAuthor('Credentials','https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                .setDescription(`<@${message.author.id}> The Order number is already in use by <@${currentUser}>`)
                .setImage('https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                .setTimestamp(new Date())
                .setFooter('Kindly ensure your enter valid order number',)
            message.channel.send({
                embeds:[commandEmbed]
            })
            return;
    }

    WooCommerce.get(`orders/${command[2]}`)
        .then((response) => {
            if (response.data.billing.email != command[1]) {
                const commandEmbed = new MessageEmbed()
                        .setColor('RANDOM')
                        .setTitle('Invalid Email')
                        .setAuthor('Credentials','https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                        .setDescription(`<@${message.author.id}> Please enter the email you used for your purchase`)
                        .setImage('https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                        .setTimestamp(new Date())
                        .setFooter('Kindly re-check your email',)
                    message.channel.send({
                        embeds:[commandEmbed]
                    })
                    return;
            }

            let role = message.guild?.roles.cache.find(r => r.name.toLowerCase().includes("champions"));
            if (role == undefined) {
                message.guild?.roles.create({
                    name: 'Champions'
                })
            }
            role = message.guild?.roles.cache.find(r => r.name.toLowerCase().includes("champions"));
            if (role != undefined) {
                message.member?.roles.add(role);
            }
            orders.push(newOrder);
            const commandEmbed = new MessageEmbed()
                        .setColor('RANDOM')
                        .setTitle('Success')
                        .setAuthor('Credentials','https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                        .setDescription(`<@${message.author.id}> Thank you for verifying your Purchase.`)
                        .setImage('https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                        .setTimestamp(new Date())
                        .setFooter('Success.',)
                    message.channel.send({
                        embeds:[commandEmbed]
                    })
                    return;
        })
        .catch((error) => {
            const commandEmbed = new MessageEmbed()
                        .setColor('RANDOM')
                        .setTitle('Your Order Does Not Exist')
                        .setAuthor('Credentials','https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                        .setDescription(`<@${message.author.id}> This Order Number does not exist`)
                        .setImage('https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                        .setTimestamp(new Date())
                        .setFooter('Kindly re-check your order number',)
                    message.channel.send({
                        embeds:[commandEmbed]
                    })
                    return;
        });
}

function postWhitelist(message: Message, command: string[]) {
    if (message.member?.roles.cache.find(role => role.name.toLowerCase() == 'whitelist')) {
        if (command.length <= 1) {
            const commandEmbed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle('Enter your credentials')
                .setAuthor('Credentials','https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                .setDescription(`<@${message.author.id}> Please Enter Your email and wallet address e.g. /whitelist user@memail.com 0x4523g35gg35g53`)
                .setImage('https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
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
                    .setAuthor('Credentials','https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                    .setDescription(`<@${message.author.id}> Your Address: ${command[2]} and email: ${command[1]} has been saved successfully.`)
                    .setImage('https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
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
                    .setAuthor('ERROR!','https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
                    .setImage('https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
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
        .setAuthor('Whitelist','https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
        .setDescription('/whitelist user@memail.com 0x4523g35gg35g53')
        .setImage('https://cdn.discordapp.com/attachments/991330824815394819/991336747684347914/verify.png')
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