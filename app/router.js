'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  router.get('/getMidPrice', controller.home.getMidPrice);
  router.get('/getPriceImpact', controller.home.getPriceImpact);
  router.get('/getEstimateDAI', controller.home.getEstimateDAI);
  router.get('/getEstimateETH', controller.home.getEstimateETH);

};
