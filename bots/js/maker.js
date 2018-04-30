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
    service.getBlockNumber(),
  ]);
})
.then((results) => {
  const [walletETH, walletToken, MetaDollarETH, MetaDollarToken, blockNumber] = results;
  console.log(`Balance (wallet, ETH): ${service.toEth(walletETH, 18).toNumber().toFixed(3)}`);
  console.log(`Balance (ED, ETH): ${service.toEth(MetaDollarETH, 18).toNumber().toFixed(3)}`);
  console.log(`Balance (wallet, token): ${service.toEth(walletToken, token.decimals).toNumber().toFixed(3)}`);
  console.log(`Balance (ED, token): ${service.toEth(MetaDollarToken, token.decimals).toNumber().toFixed(3)}`);
  console.log(`My existing buy orders: ${service.state.myOrders.buys.length}`);
  console.log(`My existing sell orders: ${service.state.myOrders.sells.length}`);
  const ordersPerSide = 1;
  const expires = blockNumber + 10;
  const buyOrdersToPlace = ordersPerSide - service.state.myOrders.buys.length;
  const sellOrdersToPlace = ordersPerSide - service.state.myOrders.sells.length;
  const buyVolumeToPlace = MetaDollarETH;
  const sellVolumeToPlace = MetaDollarToken;
  if (service.state.orders.buys.length <= 0 || service.state.orders.sells.length <= 0) {
    throw new Error('Market is not two-sided, cannot calculate mid-market');
  }
  const bestBuy = Number(service.state.orders.buys[0].price);
  const bestSell = Number(service.state.orders.sells[0].price);
  // Make sure we have a reliable mid market
  if (Math.abs((bestBuy - bestSell) / (bestBuy + bestSell) / 2.0) > 0.05) {
    throw new Error('Market is too wide, will not place orders');
  }
  const midMarket = (bestBuy + bestSell) / 2.0;
  const orders = [];
  for (let i = 0; i < sellOrdersToPlace; i += 1) {
    const price = midMarket + ((i + 1) * midMarket * 0.05);
    const amount = service.toEth(sellVolumeToPlace / sellOrdersToPlace, token.decimals);
    console.log(`Sell ${amount.toNumber().toFixed(3)} @ ${price.toFixed(9)}`);
    try {
      const order = service.createOrder('sell', expires, price, amount, token, user);
      orders.push(order);
    } catch (err) {
      console.log(err);
    }
  }
  for (let i = 0; i < buyOrdersToPlace; i += 1) {
    const price = midMarket - ((i + 1) * midMarket * 0.05);
    const amount = service.toEth(buyVolumeToPlace / price / buyOrdersToPlace, token.decimals);
    console.log(`Buy ${amount.toNumber().toFixed(3)} @ ${price.toFixed(9)}`);
    try {
      const order = service.createOrder('buy', expires, price, amount, token, user);
      orders.push(order);
    } catch (err) {
      console.log(err);
    }
  }
  Promise.all(orders.map(order => service.placeOrder(order)))
  .then(() => {
    console.log('Done');
    process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit();
  });
})
.catch((err) => {
  console.log(err);
  process.exit();
});
