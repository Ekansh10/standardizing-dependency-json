/**
 * testConverter.ts
 * This file demonstrates how to use the dependency converter.
 */

import * as fs from 'fs';
import * as path from 'path';
import { convertDependencyFile, isStandardizedDependencyGraph } from './dependencyConverter';

// Function to read a JSON file
function readJsonFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

// Function to save the standardized JSON to a file
function saveStandardizedJson(data: any, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Standardized JSON saved to ${outputPath}`);
}

// Process a single file
function processFile(inputPath: string, outputPath: string): void {
  try {
    console.log(`Processing ${inputPath}...`);
    if (!fs.existsSync(inputPath)) {
      console.error(`File not found: ${inputPath}`);
      return;
    }
    
    const jsonString = readJsonFile(inputPath);
    const standardizedJson = convertDependencyFile(jsonString);
    
    if (isStandardizedDependencyGraph(standardizedJson)) {
      saveStandardizedJson(standardizedJson, outputPath);
      
      // Print some stats about the converted data
      console.log(`Project: ${standardizedJson.projectName}`);
      console.log(`Language: ${standardizedJson.language}`);
      console.log(`Nodes: ${standardizedJson.nodes.length}`);
      console.log(`Edges: ${standardizedJson.edges.length}`);
    } else {
      console.error('The converted data is not in the expected format.');
    }
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

// Main function
function main(): void {
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
    } else {
      console.error(`File not found: ${inputFile}`);
    }
  });
}

// Run the main function
main(); 