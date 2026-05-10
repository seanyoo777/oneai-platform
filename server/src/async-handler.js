/**
 * Express 4 async 라우트에서 거부된 Promise를 next(err)로 넘겨
 * index.js 전역 오류 미들웨어가 처리하게 합니다.
 */
function asyncHandler(fn) {
  return function asyncRoute(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
