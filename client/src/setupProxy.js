const { legacyCreateProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/api"],
    legacyCreateProxyMiddleware({
      // target: "http://127.0.0.1:5000",
      target: "http://172.20.10.2:5000",
      // target: "http://10.0.1.55:5000",
      changeOrigin: true,
    }),
  );
  app.use(
    ["/files", "/convert-pgm", "/save-image", "/crop-image", "/rotate"],
    legacyCreateProxyMiddleware({
      // target: "http://127.0.0.1:5000",
      target: "http://172.20.10.2:5000",
      // target: "http://10.0.1.55:5000",
      changeOrigin: true,
    }),
  );
};
