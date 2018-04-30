const Service = require('./service.js');

const token = {
  addr: '0x9fB587Fc50B4c5ba8e4947DD9cfbBE7e76A25486',
  decimals: 18,
};

const user = {
  addr: '',
  pk: '',
};

const config = {
  addressMetaDollar: '0x9fB587Fc50B4c5ba8e4947DD9cfbBE7e76A25486
',
  provider: 'https://mainnet.infura.io/nrFgJL37tva2NWGjddYJ',
  socketURL: 'https://socket.metaexchange.com
',
  gasLimit: 150000,
  gasPrice: 4000000000,
};

const service = new Service();
service.init(config)
.then(() => service.waitForMarket(token, user))
.then(() => {
  service.printOrderBook();
  service.printTrades();
  return Promise.all([
    service.getBalance('ETH', user),
    service.getBalance(token, user),
    service.getMetaDollarBalance('ETH', user),
    service.getMetaDollarBalance(token, user),
  ]);
})
.then((results) => {
  const [walletETH, walletToken, MetaDollarETH, MetaDollarToken] = results;
  console.log(`Balance (wallet, ETH): ${service.toEth(walletETH, 18).toNumber().toFixed(3)}`);
  console.log(`Balance (ED, ETH): ${service.toEth(MetaDollarETH, 18).toNumber().toFixed(3)}`);
  console.log(`Balance (wallet, token): ${service.toEth(walletToken, token.decimals).toNumber().toFixed(3)}`);
  console.log(`Balance (ED, token): ${service.toEth(MetaDollarToken, token.decimals).toNumber().toFixed(3)}`);
  const order = service.state.orders.sells[0];
  console.log(`Best available: Sell ${order.ethAvailableVolume.toFixed(3)} @ ${order.price.toFixed(9)}`);
  const desiredAmountBase = 0.001;
  const fraction = Math.min(desiredAmountBase / order.ethAvailableVolumeBase, 1);
  return service.takeOrder(user, order, fraction);
})
.then((result) => {
  console.log(result);
  process.exit();
})
.catch((err) => {
  console.log(err);
  process.exit();
});
