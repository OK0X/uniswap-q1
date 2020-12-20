'use strict';

const BaseController = require('./base');

const { ethers } = require("ethers");
const provider = ethers.getDefaultProvider('ropsten', {
  etherscan: '7PJM9WX71AEI9SF29XG318XMB9CE4JWMYP',
  infura: '9a81acdff7f54d69863937a52f5e7244',
  alchemy: 'Twy7aBeLRxo1wgCcDI4Bxs5t334nm0V0',
  pocket: ''
});

const UNISWAP = require('@uniswap/sdk');
const { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType, JSBI, BigintIsh, Percent,FACTORY_ADDRESS } = UNISWAP;
const DAI = new Token(ChainId.ROPSTEN, '0x2c3af037312ab82a367799c27e3d4e7263c0f04d', 18);

const UniV2Router02Address = '0x38811859AF5cd7f80340F4e4A4a75b41C5376Cd5';
const UniV2Router02ABI = require('../abi/UniswapV2Router02.json');
const testABI = require('../abi/test.json');



class HomeController extends BaseController {


  async getMidPrice() {

    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider)
    const route = new Route([pair], WETH[DAI.chainId])

    this.ok({
      midPrice: route.midPrice.toSignificant(6),//642.996
    })

  }

  async getPriceImpact() {

    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider)
    const route = new Route([pair], WETH[DAI.chainId])
    console.log('midPrice---', route.midPrice.toSignificant(6))
    const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], '1000000000000000000'), TradeType.EXACT_INPUT)
    console.log('executionPrice---', trade.executionPrice.toSignificant(6))
    const priceImpact = trade.executionPrice.raw.subtract(route.midPrice.raw)
    this.ok({
      priceImpact: priceImpact.toSignificant(6)
    })

  }


  async getEstimateDAI() {

    const { ethNum } = this.ctx.query
    console.log('given eth number---', ethNum)
    const pair = await Fetcher.fetchPairData(WETH[DAI.chainId], DAI, provider)
    const [tokenAmount,] = pair.getOutputAmount(new TokenAmount(WETH[DAI.chainId], ethers.utils.parseEther(ethNum).toString()))
    this.ok(tokenAmount.toSignificant(6))
  }

  async getEstimateETH() {
    const { daiNum } = this.ctx.query
    console.log('given dai number---', daiNum)
    const pair = await Fetcher.fetchPairData(WETH[DAI.chainId], DAI, provider)
    const [tokenAmount,] = pair.getInputAmount(new TokenAmount(DAI, ethers.utils.parseEther(daiNum).toString()))
    this.ok(tokenAmount.toSignificant(6))
  }

  async getMinimumAmountOut() {
    const { ethNum } = this.ctx.query
    console.log('given eth number---', ethNum)
    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider)
    const route = new Route([pair], WETH[DAI.chainId])
    const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], ethers.utils.parseEther(ethNum).toString()), TradeType.EXACT_INPUT)
    const slippageTolerance = new Percent('50', '10000') //0.5%
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).toSignificant(6)
    this.ok(amountOutMin)
  }

  async swapETHforDAI() {
    // const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider)
    // const route = new Route([pair], WETH[DAI.chainId])
    // const amountIn = '1000000000000000000' // 1 ETH
    // const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], amountIn), TradeType.EXACT_INPUT)

    // const slippageTolerance = new Percent('50', '10000') //0.5%
    const amountOutMin = ethers.utils.parseEther('1')
    const path = ['0x2c3af037312ab82a367799c27e3d4e7263c0f04d', '0x24564639ef1615887f23fefb2265289220894139']
    const to = '0xC8b7a5561e29E7Cf36ed970cc73D9E37da3EB823' // 这里填接收DAI的地址
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20分钟
    const value = ethers.utils.parseEther('0.1')

    console.log(value)
    console.log(amountOutMin)

    //初始化钱包
    const mnemonicWallet = ethers.Wallet.fromMnemonic('remember web thought inherit donkey negative couch young fly loud flash dry');//仅供测试，正式使用需在app端导入钱包使用
    const wallet = mnemonicWallet.connect(provider);

    //实例化合约
    let uniV2Router = new ethers.Contract(
      UniV2Router02Address,
      UniV2Router02ABI,
      provider
    );

    uniV2Router = uniV2Router.connect(wallet);

    const overrides = {
      value: value
    };
    //发起交易
    uniV2Router.swapExactETHForTokens(amountOutMin, path, to, deadline, overrides).then(tx => {
      console.log(tx)//tx.hash
    })

    // let test = new ethers.Contract(
    //   '0xb05fC77542d3cB775C2CC0fEEEf0C65f49fF9a42',
    //   testABI,
    //   provider
    // );

    // test = test.connect(wallet);
    // test.setNum(10).then(tx => {
    //   console.log(tx)//tx.hash 0x4bdcd832f4a027144d26d72ba72786892693fc8ef5fff881a478dc8a87027b50
    // })

    this.ok(0)
  }

}

module.exports = HomeController;
