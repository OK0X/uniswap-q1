
// const { ethers } = require("ethers");
// const provider = ethers.getDefaultProvider('ropsten', {
//   etherscan: '7PJM9WX71AEI9SF29XG318XMB9CE4JWMYP',
//   infura: '9a81acdff7f54d69863937a52f5e7244',
//   alchemy: 'Twy7aBeLRxo1wgCcDI4Bxs5t334nm0V0',
//   pocket: ''
// });//etherscan.io被墙其api访问不了
const factoryAddress = '0x74073279A2809fAE01C63838061E58Ea19faB76A';
const factoryABI = require('../abi/factory.json');

// const Web3 = require('web3');
// var web3 = new Web3('https://ropsten.infura.io/v3/9a81acdff7f54d69863937a52f5e7244');
var Contract = require('web3-eth-contract');
Contract.setProvider('wss://ropsten.infura.io/ws/v3/9a81acdff7f54d69863937a52f5e7244');

module.exports = app => {
  return {
    schedule: {
      interval: '1000000000000s',
      type: 'worker',
      immediate: true
    },
    async task(ctx) {


      let pairData = {}

      var contract = new Contract(factoryABI, factoryAddress);
      //监听所有流动池中token的变动
      contract.events.TokenReserveChange({
        fromBlock: 0
      }, function (error, event) { })
        .on('data', function (event) {
          console.log('event data...')
          pairData[event.returnValues.pair] = {
            token0: event.returnValues.token0,
            token1: event.returnValues.token1,
            reserve0: event.returnValues.reserve0,
            reserve1: event.returnValues.reserve1
          }

          ctx.app.pairData = pairData

        })

    }
  }
};