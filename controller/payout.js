import { attachBankAccount, createCustomer, createPayout } from ".././utils/stripeUtils.js";



// create customer
export const createPayoutCustomer = async (req,res) => {
    const { email, bankAccountDetails } = req.body;
    

    console.log(req.body)
    try {
      const customerId = await createCustomer(email);
      const bankAccountId = await attachBankAccount(customerId, bankAccountDetails);
      res.send({ customerId, bankAccountId });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
}

// create payout
export const createUserPayout = async (req,res) => {
    const { amount, currency, destination } = req.body;
    try {
      const payout = await createPayout(amount, currency, destination);
      res.send(payout);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
}

// 

