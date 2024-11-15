const { legacyCreateProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/upload",
    legacyCreateProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    }),
  );
  app.use(
    "/rotate",
    legacyCreateProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    }),
  );
  app.use(
    "/api",
    legacyCreateProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    }),
  );
  app.use(
    "/file",
    legacyCreateProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    }),
  );
  app.use(
    "/files",
    legacyCreateProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    }),
  );
  app.use(
    "/convert-pgm",
    legacyCreateProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    }),
  );
  app.use(
    "/save-image",
    legacyCreateProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    }),
  );
  app.use(
    "/crop-image",
    legacyCreateProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    }),
  );
};
