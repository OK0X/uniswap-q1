'use strict';

const BaseController = require('./base');

const UNISWAP = require('@uniswap/sdk');
const { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType } = UNISWAP;
const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18)

const JSBI = require('jsbi');

class HomeController extends BaseController {
  async index() {
    this.ok('Hello ok!');
  }

  async getMidPrice() {

    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId])
    const route = new Route([pair], WETH[DAI.chainId])

    this.ok({
      midPrice: route.midPrice.toSignificant(6),//642.18
    })

  }

  // async getExecPrice() {
  //   const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId])
  //   const route = new Route([pair], WETH[DAI.chainId])

  //   const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], '1000000000000000000'), TradeType.EXACT_INPUT)

  //   this.ok(trade.executionPrice.toSignificant(6))

  // }


  async getPriceImpact() {

    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId])
    const route = new Route([pair], WETH[DAI.chainId])
    const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], '1000000000000000000'), TradeType.EXACT_INPUT)

    const priceImpact = JSBI.subtract(trade.executionPrice.raw, route.midPrice.raw)
    this.ok({
      priceImpact: String(priceImpact)
    })

  }



}

module.exports = HomeController;
