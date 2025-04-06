const yaml = require("js-yaml");
const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");

class IntegrationManager {
  constructor(manifestDir) {
    this.manifestDir = manifestDir;
    this.integrations = [];
  }

  loadManifests() {
    // const yamlFiles = glob.sync(`${this.manifestDir}/**/*.yaml`);
    const manifestFile = path.join(`${this.manifestDir}`, "integration.yaml");

    if (!fs.existsSync(manifestFile)) {
      console.error("Integration file not found");
      return;
    }

    try {
      const fileContents = fs.readFileSync(manifestFile, "utf8");
      const manifest = yaml.load(fileContents);

      if (!manifest.chat_manifest || !Array.isArray(manifest.rest_app)) {
        console.warn(`Invalid manifest file structure`);
        return;
      }

      this.integrations = manifest.rest_app
        .map((app) => app.name)
        .filter(Boolean);

      console.log("Loaded the integration file");
    } catch (error) {
      console.error(` Error Loading the Manifest file: ${error}`);
    }
  }
  getIntegrations() {
    return this.integrations;
  }
}

module.exports = IntegrationManager;
