/**
 * dependencyConverter.ts
 * This file converts various dependency JSON formats into a standardized format
 * for visualization in a VS Code extension.
 */
export interface StandardizedNode {
    id: string;
    name: string;
    type: 'component' | 'model' | 'class' | 'function' | 'package' | 'app' | 'interface' | 'other';
    language: 'typescript' | 'django' | 'java' | 'other';
    filePath?: string;
    packagePath?: string;
    metadata?: Record<string, any>;
}
export interface StandardizedEdge {
    source: string;
    target: string;
    type: string;
    metadata?: Record<string, any>;
}
export interface StandardizedDependencyGraph {
    projectName: string;
    language: string;
    version: string;
    analyzedAt: string;
    nodes: StandardizedNode[];
    edges: StandardizedEdge[];
    metadata?: Record<string, any>;
}
/**
 * Detect the type of dependency JSON and convert it to the standardized format
 */
export declare function convertDependencies(json: any): StandardizedDependencyGraph;
/**
 * Main function to read a JSON file and convert it to the standardized format
 */
export declare function convertDependencyFile(jsonString: string): StandardizedDependencyGraph;
export declare function isStandardizedDependencyGraph(json: any): json is StandardizedDependencyGraph;
