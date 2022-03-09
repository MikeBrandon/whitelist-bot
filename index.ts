import DiscordJS, { Intents } from 'discord.js';
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
            if (command.length <= 1) {
                message.reply('Please Enter Your email and wallet address e.g. /whitelist user@memail.com 0x4523g35gg35g53');
            } else {
                if (ValidateEmail(command[1])) {
                    setValue({
                        discordUsername: message.author.username,
                        email: command[1],
                        walletAddress: command[2]
                    }, message.author.id)
                    message.reply(`Your Address: ${command[2]} and email: ${command[1]} has been saved successfully.`);
                } else {
                    message.reply(`Please enter a valid email.`);
                }
            }
        } else if(command[0] == '/help') {
            message.reply('/whitelist user@memail.com 0x4523g35gg35g53');
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