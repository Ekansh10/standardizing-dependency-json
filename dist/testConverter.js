"use strict";
/**
 * testConverter.ts
 * This file demonstrates how to use the dependency converter.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dependencyConverter_1 = require("./dependencyConverter");
// Function to read a JSON file
function readJsonFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}
// Function to save the standardized JSON to a file
function saveStandardizedJson(data, outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Standardized JSON saved to ${outputPath}`);
}
// Process a single file
function processFile(inputPath, outputPath) {
    try {
        console.log(`Processing ${inputPath}...`);
        if (!fs.existsSync(inputPath)) {
            console.error(`File not found: ${inputPath}`);
            return;
        }
        const jsonString = readJsonFile(inputPath);
        const standardizedJson = (0, dependencyConverter_1.convertDependencyFile)(jsonString);
        if ((0, dependencyConverter_1.isStandardizedDependencyGraph)(standardizedJson)) {
            saveStandardizedJson(standardizedJson, outputPath);
            // Print some stats about the converted data
            console.log(`Project: ${standardizedJson.projectName}`);
            console.log(`Language: ${standardizedJson.language}`);
            console.log(`Nodes: ${standardizedJson.nodes.length}`);
            console.log(`Edges: ${standardizedJson.edges.length}`);
        }
        else {
            console.error('The converted data is not in the expected format.');
        }
    }
    catch (error) {
        console.error(`Error processing ${inputPath}:`, error);
    }
}
// Main function
function main() {
    // Define the file paths
    const workingDir = process.cwd();
    const inputFiles = [
        path.join(workingDir, '/dependency-jsons/typescript_dependencies.json'),
        path.join(workingDir, '/dependency-jsons/django_dependencies.json'),
        path.join(workingDir, '/dependency-jsons/java-dependencies.json')
    ];
    // Process each file
    inputFiles.forEach(inputFile => {
        if (fs.existsSync(inputFile)) {
            const fileName = path.basename(inputFile);
            const outputFile = path.join(workingDir, `standardized_${fileName}`);
            processFile(inputFile, outputFile);
        }
        else {
            console.error(`File not found: ${inputFile}`);
        }
    });
}
// Run the main function
main();
