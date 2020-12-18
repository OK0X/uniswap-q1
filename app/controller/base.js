const { Controller } = require('egg');


class BaseController extends Controller {

    apiResult(data, code = 0, message) {

        this.ctx.body = {
            code,
            data,
            message
        }


    }

    error(code, message) {
        return this.apiResult(null, code, message);
    }

    ok(data) {
        return this.apiResult(data);
    }

    awaitWrap(promise) {
        return promise
            .then(data => [null, data])
            .catch(err => [err, null])
    }


}

module.exports = BaseController;