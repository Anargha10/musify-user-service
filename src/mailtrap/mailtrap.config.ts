import { MailtrapClient } from "mailtrap";
import * as dotenv from 'dotenv'

dotenv.config();
const TOKEN = process.env.MAILTRAP_TOKEN as string;
console.log(`mailtrap token:${TOKEN}`)
export const mailtrapclient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@imanargha.shop",
  name: "Anargha",
};
