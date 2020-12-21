'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  
  router.get('/getEstimateDAI', controller.home.getEstimateDAI);
  router.get('/getEstimateETH', controller.home.getEstimateETH);
  router.get('/getMidPrice', controller.home.getMidPrice);
  router.get('/getPriceImpact', controller.home.getPriceImpact);
  router.get('/getMinimumAmountOut', controller.home.getMinimumAmountOut);
  router.get('/swapETHforDAI', controller.home.swapETHforDAI);
  router.get('/swapDaiForETH', controller.home.swapDaiForETH);

};
