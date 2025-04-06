/**
 * UniversalDependencyFormat.ts
 * 
 * This file contains type definitions for the universal dependency format
 * that all framework/language specific JSON formats are converted to.
 */

/**
 * Represents a node in the dependency graph (component, class, model, etc.)
 */
export interface UniversalNode {
  /** Unique identifier for the node */
  id: string;
  
  /** Display name of the node */
  name: string;
  
  /** Type of the node */
  type: 'component' | 'model' | 'class' | 'function' | 'package' | 'app' | 'interface' | 'other';
  
  /** Source language or framework */
  language: 'typescript' | 'django' | 'java' | 'other';
  
  /** File path where the node is defined (if applicable) */
  filePath?: string;
  
  /** Package or module path (if applicable) */
  packagePath?: string;
  
  /** Additional metadata specific to the node type */
  metadata?: Record<string, any>;
}

/**
 * Represents a relationship/edge between two nodes in the dependency graph
 */
export interface UniversalEdge {
  /** ID of the source node */
  source: string;
  
  /** ID of the target node */
  target: string;
  
  /** Type of relationship (imports, extends, uses, etc.) */
  type: string;
  
  /** Additional metadata about the relationship */
  metadata?: Record<string, any>;
}

/**
 * Project-level statistics and metadata
 */
export interface ProjectMetadata {
  /** Name of the tool that generated this data */
  generatedBy?: string;
  
  /** Total number of files analyzed */
  totalFiles?: number;
  
  /** Time taken for analysis */
  analysisTime?: string;
  
  /** Analysis configuration */
  configuration?: Record<string, any>;
  
  /** Statistical information */
  stats?: {
    componentCount?: number;
    classCount?: number;
    functionCount?: number;
    packageCount?: number;
    [key: string]: number | undefined;
  };
  
  /** Any other metadata */
  [key: string]: any;
}

/**
 * The universal dependency graph format
 */
export interface UniversalDependencyGraph {
  /** Name of the project */
  projectName: string;
  
  /** Language or framework of the project */
  language: string;
  
  /** Version of the language or framework */
  version: string;
  
  /** ISO timestamp when the analysis was performed */
  analyzedAt: string;
  
  /** Array of nodes in the dependency graph */
  nodes: UniversalNode[];
  
  /** Array of edges representing relationships between nodes */
  edges: UniversalEdge[];
  
  /** Additional project-level metadata */
  metadata?: ProjectMetadata;
}

/**
 * Type guard to check if an object conforms to the UniversalDependencyGraph interface
 */
export function isUniversalDependencyGraph(obj: any): obj is UniversalDependencyGraph {
  return (
    obj &&
    typeof obj.projectName === 'string' &&
    typeof obj.language === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.analyzedAt === 'string' &&
    Array.isArray(obj.nodes) &&
    Array.isArray(obj.edges)
  );
} 