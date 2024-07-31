import stripe from "./stripe.js"

export const createCustomer = async (email) => {
  const customer = await stripe.customers.create({
    email,
  });
  return customer.id;
};

export const attachBankAccount = async (customerId, bankAccountDetails) => {
  const bankAccount = await stripe.customers.createSource(customerId, {
    source: {
      object: 'bank_account',
      country: 'US',
      currency: 'usd',
      account_holder_name: bankAccountDetails.accountHolderName,
      account_holder_type: 'individual',
      routing_number: bankAccountDetails.routingNumber,
      account_number: bankAccountDetails.accountNumber,
    },
  });
  return bankAccount.id;
};

export const createPayout = async (amount, currency, destination) => {
  const payout = await stripe.transfers.create({
    amount,
    currency,
    destination,
  });
  return payout;
};
