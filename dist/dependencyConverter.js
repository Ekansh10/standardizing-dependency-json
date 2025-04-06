"use strict";
/**
 * dependencyConverter.ts
 * This file converts various dependency JSON formats into a standardized format
 * for visualization in a VS Code extension.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStandardizedDependencyGraph = exports.convertDependencyFile = exports.convertDependencies = void 0;
/**
 * Convert TypeScript dependencies to the standardized format
 */
function convertTypeScriptDependencies(json) {
    const nodes = [];
    const edges = [];
    // Add components as nodes
    json.components.forEach(component => {
        nodes.push({
            id: component.id,
            name: component.name,
            type: component.type === 'class' ? 'class' : 'function',
            language: 'typescript',
            filePath: component.filePath,
            metadata: Object.assign({ isDefault: component.isDefault, interfaces: component.interfaces, types: component.types }, (component.classSpecific || component.functionSpecific || component.arrowSpecific))
        });
    });
    // Add dependencies as edges
    json.dependencies.forEach(dependency => {
        edges.push({
            source: dependency.source,
            target: dependency.target,
            type: dependency.type,
            metadata: {
                usageLocations: dependency.usageLocations
            }
        });
    });
    return {
        projectName: json.metadata.projectName,
        language: 'TypeScript',
        version: json.metadata.typescript.version,
        analyzedAt: json.metadata.analyzedAt,
        nodes,
        edges,
        metadata: json.metadata
    };
}
/**
 * Convert Django dependencies to the standardized format
 */
function convertDjangoDependencies(json) {
    const nodes = [];
    const edges = [];
    // Add apps as nodes
    json.apps.forEach(app => {
        nodes.push({
            id: `app_${app.name}`,
            name: app.name,
            type: 'app',
            language: 'django',
            packagePath: app.path,
            metadata: {
                is_project_app: app.is_project_app,
                note: app.note
            }
        });
    });
    // Add models as nodes
    json.models.forEach(model => {
        const modelId = `model_${model.app}_${model.name}`;
        nodes.push({
            id: modelId,
            name: model.name,
            type: 'model',
            language: 'django',
            packagePath: model.app,
            metadata: {
                fields: model.fields,
                methods: model.methods,
                meta: model.meta
            }
        });
        // Add app-model relationship
        edges.push({
            source: `app_${model.app}`,
            target: modelId,
            type: 'contains',
            metadata: {}
        });
        // Add model relationships as edges
        model.relationships.forEach(rel => {
            if (rel.related_model) {
                edges.push({
                    source: modelId,
                    target: `model_${model.app}_${rel.related_model}`,
                    type: rel.type,
                    metadata: {
                        field_name: rel.field_name,
                        related_name: rel.related_name
                    }
                });
            }
        });
    });
    return {
        projectName: json.metadata.projectName,
        language: 'Django',
        version: json.metadata.django.version,
        analyzedAt: json.metadata.analyzedAt,
        nodes,
        edges,
        metadata: json.metadata
    };
}
/**
 * Recursively process Java elements to extract nodes and edges
 */
function processJavaElements(elements, nodes, edges, parentPath = '') {
    elements.forEach(element => {
        const isPackage = element.name.startsWith('.');
        const currentPath = isPackage ? (parentPath + element.name) : element.name;
        if (element.class) {
            // This is a class
            nodes.push({
                id: currentPath,
                name: currentPath.split('.').pop() || '',
                type: element.interface ? 'interface' : 'class',
                language: 'java',
                packagePath: element.packageName,
                filePath: element.sourceFile,
                metadata: {
                    superClassName: element.superClassName,
                    interfaces: element.interfaces,
                    fields: element.fields,
                    methods: element.methods,
                    final: element.final,
                    abstract: element.abstract
                }
            });
            // Add outgoing dependencies
            if (element.outGoingDependencies) {
                element.outGoingDependencies.forEach((dep) => {
                    edges.push({
                        source: currentPath,
                        target: dep,
                        type: 'dependency',
                        metadata: {}
                    });
                });
            }
            // Add incoming dependencies
            if (element.incomingDependencies) {
                element.incomingDependencies.forEach((dep) => {
                    edges.push({
                        source: dep,
                        target: currentPath,
                        type: 'dependency',
                        metadata: {}
                    });
                });
            }
            // Add superclass relationship
            if (element.superClassName && element.superClassName !== 'java.lang.Object') {
                edges.push({
                    source: currentPath,
                    target: element.superClassName,
                    type: 'extends',
                    metadata: {}
                });
            }
        }
        else if (isPackage) {
            // This is a package
            nodes.push({
                id: currentPath,
                name: element.name.slice(1),
                type: 'package',
                language: 'java',
                packagePath: currentPath,
                metadata: {}
            });
        }
        // Process nested elements
        if (element.elements && element.elements.length > 0) {
            processJavaElements(element.elements, nodes, edges, currentPath);
        }
    });
}
/**
 * Convert Java dependencies to the standardized format
 */
function convertJavaDependencies(json) {
    const nodes = [];
    const edges = [];
    // Root node for the top-level package
    nodes.push({
        id: json.name,
        name: json.name,
        type: 'package',
        language: 'java',
        packagePath: json.name,
        metadata: {}
    });
    // Process all elements recursively
    processJavaElements(json.elements, nodes, edges, json.name);
    return {
        projectName: json.name,
        language: 'Java',
        version: 'unknown',
        analyzedAt: new Date().toISOString(),
        nodes,
        edges,
        metadata: {}
    };
}
/**
 * Detect the type of dependency JSON and convert it to the standardized format
 */
function convertDependencies(json) {
    // Detect TypeScript dependencies
    if (json.metadata && json.metadata.typescript && json.components) {
        return convertTypeScriptDependencies(json);
    }
    // Detect Django dependencies
    if (json.metadata && json.metadata.django && json.apps) {
        return convertDjangoDependencies(json);
    }
    // Detect Java dependencies
    if (json.name && json.elements && Array.isArray(json.elements)) {
        return convertJavaDependencies(json);
    }
    // Fallback for unknown formats
    throw new Error('Unknown dependency format. Cannot convert to standardized format.');
}
exports.convertDependencies = convertDependencies;
/**
 * Strips comments from JSON string (which is not standard JSON but used in some configs)
 */
function stripJsonComments(jsonString) {
    // Remove single-line comments (// ...)
    let result = jsonString.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments (/* ... */)
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    return result;
}
/**
 * Main function to read a JSON file and convert it to the standardized format
 */
function convertDependencyFile(jsonString) {
    try {
        // Strip comments from JSON string before parsing
        const cleanJsonString = stripJsonComments(jsonString);
        const json = JSON.parse(cleanJsonString);
        return convertDependencies(json);
    }
    catch (error) {
        throw new Error(`Failed to convert dependency file: ${error}`);
    }
}
exports.convertDependencyFile = convertDependencyFile;
// Export a type guard function to validate if a JSON is in standardized format
function isStandardizedDependencyGraph(json) {
    return (json &&
        typeof json.projectName === 'string' &&
        typeof json.language === 'string' &&
        Array.isArray(json.nodes) &&
        Array.isArray(json.edges));
}
exports.isStandardizedDependencyGraph = isStandardizedDependencyGraph;
