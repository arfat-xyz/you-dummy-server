import importStripe from "stripe";
export const stripe = new importStripe(process.env.STRIPE_SECRET as string);
