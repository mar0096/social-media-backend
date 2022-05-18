const notFoundMiddleware = (req, res) =>
  res.status(404).send("Route dose not exist");

export default notFoundMiddleware;
