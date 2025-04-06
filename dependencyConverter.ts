/**
 * dependencyConverter.ts
 * This file converts various dependency JSON formats into a standardized format
 * for visualization in a VS Code extension.
 */

// Define interfaces for input JSON formats
interface TypeScriptDependencies {
  metadata: {
    projectName: string;
    totalFiles: number;
    analyzedAt: string;
    typescript: {
      version: string;
      strict: boolean;
    }
  };
  components: Array<{
    id: string;
    name: string;
    filePath: string;
    type: string;
    isDefault: boolean;
    interfaces?: any[];
    types?: any[];
    classSpecific?: any;
    functionSpecific?: any;
    arrowSpecific?: any;
  }>;
  dependencies: Array<{
    source: string;
    target: string;
    type: string;
    usageLocations: any[];
  }>;
}

interface DjangoDependencies {
  metadata: {
    projectName: string;
    totalApps: number;
    totalModels: number;
    totalViews: number;
    analyzedAt: string;
    django: {
      version: string;
      debug: boolean;
    }
  };
  apps: Array<{
    name: string;
    path: string;
    is_project_app: boolean;
    note?: string;
  }>;
  models: Array<{
    name: string;
    app: string;
    fields: Array<{
      name: string;
      type: string;
      attributes: any;
    }>;
    methods: Array<{
      name: string;
      parameters: any[];
    }>;
    meta: any;
    relationships: Array<{
      field_name: string;
      type: string;
      related_model: string;
      related_name: string | null;
    }>;
  }>;
  // Other Django-specific properties might be here
}

interface JavaDependencies {
  name: string;
  elements: Array<{
    name: string;
    elements?: any[];
    superClassName?: string;
    interfaces?: any[];
    packageName?: string;
    sourceFile?: string;
    signature?: string;
    fields?: Array<{
      name: string;
      type: string;
      modifier: string;
      final: boolean;
      static: boolean;
    }>;
    methods?: Array<{
      accessModifier: string;
      name: string;
      parameters: string[];
      returnType: string;
      final: boolean;
      static: boolean;
      abstract: boolean;
    }>;
    outGoingDependencies?: string[];
    incomingDependencies?: string[];
    final?: boolean;
    class?: boolean;
    interface?: boolean;
    importedPackages?: any[];
    abstract?: boolean;
    package?: boolean;
  }>;
}

// Define the standardized output format
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
 * Convert TypeScript dependencies to the standardized format
 */
function convertTypeScriptDependencies(json: TypeScriptDependencies): StandardizedDependencyGraph {
  const nodes: StandardizedNode[] = [];
  const edges: StandardizedEdge[] = [];

  // Add components as nodes
  json.components.forEach(component => {
    nodes.push({
      id: component.id,
      name: component.name,
      type: component.type === 'class' ? 'class' : 'function',
      language: 'typescript',
      filePath: component.filePath,
      metadata: {
        isDefault: component.isDefault,
        interfaces: component.interfaces,
        types: component.types,
        ...(component.classSpecific || component.functionSpecific || component.arrowSpecific)
      }
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
function convertDjangoDependencies(json: DjangoDependencies): StandardizedDependencyGraph {
  const nodes: StandardizedNode[] = [];
  const edges: StandardizedEdge[] = [];

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
function processJavaElements(elements: any[], nodes: StandardizedNode[], edges: StandardizedEdge[], parentPath = '') {
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
        element.outGoingDependencies.forEach((dep: string) => {
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
        element.incomingDependencies.forEach((dep: string) => {
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
    } else if (isPackage) {
      // This is a package
      nodes.push({
        id: currentPath,
        name: element.name.slice(1), // Remove the leading dot
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
function convertJavaDependencies(json: JavaDependencies): StandardizedDependencyGraph {
  const nodes: StandardizedNode[] = [];
  const edges: StandardizedEdge[] = [];

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
    version: 'unknown', // Java dependencies don't specify a version in the sample
    analyzedAt: new Date().toISOString(),
    nodes,
    edges,
    metadata: {}
  };
}

/**
 * Detect the type of dependency JSON and convert it to the standardized format
 */
export function convertDependencies(json: any): StandardizedDependencyGraph {
  // Detect TypeScript dependencies
  if (json.metadata && json.metadata.typescript && json.components) {
    return convertTypeScriptDependencies(json as TypeScriptDependencies);
  }
  
  // Detect Django dependencies
  if (json.metadata && json.metadata.django && json.apps) {
    return convertDjangoDependencies(json as DjangoDependencies);
  }
  
  // Detect Java dependencies
  if (json.name && json.elements && Array.isArray(json.elements)) {
    return convertJavaDependencies(json as JavaDependencies);
  }
  
  // Fallback for unknown formats
  throw new Error('Unknown dependency format. Cannot convert to standardized format.');
}

/**
 * Strips comments from JSON string (which is not standard JSON but used in some configs)
 */
function stripJsonComments(jsonString: string): string {
  // Remove single-line comments (// ...)
  let result = jsonString.replace(/\/\/.*$/gm, '');
  
  // Remove multi-line comments (/* ... */)
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  
  return result;
}

/**
 * Main function to read a JSON file and convert it to the standardized format
 */
export function convertDependencyFile(jsonString: string): StandardizedDependencyGraph {
  try {
    // Strip comments from JSON string before parsing
    const cleanJsonString = stripJsonComments(jsonString);
    const json = JSON.parse(cleanJsonString);
    return convertDependencies(json);
  } catch (error) {
    throw new Error(`Failed to convert dependency file: ${error}`);
  }
}

// Export a type guard function to validate if a JSON is in standardized format
export function isStandardizedDependencyGraph(json: any): json is StandardizedDependencyGraph {
  return (
    json && 
    typeof json.projectName === 'string' &&
    typeof json.language === 'string' &&
    Array.isArray(json.nodes) &&
    Array.isArray(json.edges)
  );
} 