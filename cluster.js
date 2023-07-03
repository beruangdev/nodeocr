const cluster = require("cluster");
const os = require("os");
const app = require("./app.js"); // Assuming your main app file is named "app.js"

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);

  // Fork workers for each available CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died`);
    // Fork a new worker if a worker process dies
    cluster.fork();
  });
} else {
  // This is a worker process, so start the Express app
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Worker process ${process.pid} is running and listening on http://localhost:${PORT}`);
  });
}
