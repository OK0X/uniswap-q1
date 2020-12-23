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
const { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType, JSBI, BigintIsh, Percent, FACTORY_ADDRESS, Pair } = UNISWAP;
const DAI = new Token(ChainId.ROPSTEN, '0x2c3af037312ab82a367799c27e3d4e7263c0f04d', 18);

const UniV2Router02Address = '0xcF90da2D7134d4001FDE1094AAFE95593A9B5A22';
const UniV2Router02ABI = require('../abi/UniswapV2Router02.json');

const WETH_DAI = '0x5d2D7699dBd5695e5832E5198040a047F6cCEB02'
const WETH_USDT = '0xE51f68b5108CC82a918d2dE499b3A03124F66A10'
const WETH_CRO = '0x08Aa45287723595B00aB320e20CE5c23929c2B2f'
const DAI_CRO = '0xaa3F6e058BB8f966ea603a3325EE671E2A9ec07d'
const USDT_CRO = '0x1DF3E2e80fdc2A2a121a7547Acc68a7d69670949'


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
    const amountOutMin = ethers.utils.parseEther('40')
    const path = ['0x24564639ef1615887f23fefb2265289220894139', '0x2c3af037312ab82a367799c27e3d4e7263c0f04d']
    const to = '0xC8b7a5561e29E7Cf36ed970cc73D9E37da3EB823' // 这里填接收DAI的地址
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20分钟
    const value = ethers.utils.parseEther('0.1')


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
      console.log(tx)//tx.hash：https://ropsten.etherscan.io/tx/0x9e68f13e4cc2d8913a0b7804c0d839863338c44c2a33d7e2a34f94c7e6521ebf
    })


    this.ok(0)
  }

  async swapDaiForETH() {

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

    const amountIn = ethers.utils.parseEther('60')
    const amountOutMin = ethers.utils.parseEther('0.1')
    const path = ['0x2c3af037312ab82a367799c27e3d4e7263c0f04d', '0x24564639ef1615887f23fefb2265289220894139']
    const to = '0xC8b7a5561e29E7Cf36ed970cc73D9E37da3EB823' // 这里填接收DAI的地址
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20分钟
    // const value = ethers.utils.parseEther('0.1')
    //发起交易
    uniV2Router.swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline).then(tx => {
      console.log(tx)//tx.hash：https://ropsten.etherscan.io/tx/0x1f5884993976ba660349c0446575c63c6d8602cc0438236bd3018b0e621d0eaa
    })


    this.ok(0)

  }

  //测试best trade
  async getbestTradeExactIn() {


    const WETH = new Token(ChainId.ROPSTEN, '0x24564639ef1615887f23fefb2265289220894139', 18, 'WETH', 'WETH')
    const DAI = new Token(ChainId.ROPSTEN, '0x2c3af037312ab82a367799c27e3d4e7263c0f04d', 18, 'DAI', 'DAI')
    const USDT = new Token(ChainId.ROPSTEN, '0x3c5A535D0bda6F11884e178c3AfA268154957e75', 6, 'USDT', 'USDT')
    const CRO = new Token(ChainId.ROPSTEN, '0xbe5F7BC290Cb4A98cbdFFa868F1Ab5CA68BaDFea', 18, 'CRO', 'CRO')
    const pairData = this.ctx.app.pairData//包含所有pair最新的reverse信息
    console.log(pairData)
    const pairWD = new Pair(new TokenAmount(WETH, pairData[WETH_DAI].reserve0), new TokenAmount(DAI, pairData[WETH_DAI].reserve1))
    const pairWU = new Pair(new TokenAmount(WETH, pairData[WETH_USDT].reserve0), new TokenAmount(USDT, pairData[WETH_USDT].reserve1))
    const pairWC = new Pair(new TokenAmount(WETH, pairData[WETH_CRO].reserve0), new TokenAmount(CRO, pairData[WETH_CRO].reserve1))
    const pairDC = new Pair(new TokenAmount(DAI, pairData[DAI_CRO].reserve0), new TokenAmount(CRO, pairData[WETH_DAI].reserve1))
    const pairUC = new Pair(new TokenAmount(USDT, pairData[USDT_CRO].reserve0), new TokenAmount(CRO, pairData[USDT_CRO].reserve1))
    let pairs = [pairWD, pairWU, pairWC, pairDC, pairUC]

    let amountInTA = new TokenAmount(USDT, '1000000')//输入USDT，获取兑换CRO的best trade
    const bestTrade = Trade.bestTradeExactIn(pairs, amountInTA, CRO, { maxNumResults: 1, maxHops: 3 })
    console.log(bestTrade)
    let path=[]
    for(const p of bestTrade[0].route.path){
      path.push(p.address)
    }
    console.log(path)


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

    const amountIn = '1000000'
    const amountOutMin = ethers.utils.parseEther('1')
    const to = '0xC8b7a5561e29E7Cf36ed970cc73D9E37da3EB823' // 这里填接收DAI的地址
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20分钟
    // const value = ethers.utils.parseEther('0.1')
    //发起交易
    uniV2Router.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline).then(tx => {
      console.log(tx)//tx.hash：示例交易：https://ropsten.etherscan.io/tx/0xb0c52cc87ea89eeb3f024f7be1fe49320d7a7470ad65f1990df52e88e9da3421
    })


    this.ok({
      bestTrade: bestTrade
    })
  }

}

module.exports = HomeController;
