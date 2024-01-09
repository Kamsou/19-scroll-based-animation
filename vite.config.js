export default {
  root: "src/",
  publicDir: "../static/",
  base: "./",
  server: {
    host: true, // Open to local network and display URL
    open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env), // Open if it's not a CodeSandbox
  },
  build: {
    outDir: "../dist", // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
    rollupOptions: {
      input: {
        main: "src/index.html",
        "sphere-test-3": "src/sphere-2.html",
        sphere: "src/sphere.html",
        wolf: "src/wolf.html",
        cube: "src/cube.html",
        cone: "src/cone.html",
      },
    },
  },
};
