/**
 * Base Agent Class
 * 
 * This class serves as the foundation for all AI agents in the MCP system.
 * It provides core functionality for agent operations, interaction with the MCP,
 * and standardized interfaces for agent capabilities.
 */

import { IStorage } from '../../storage';
import { MCPService, MCPRequest, MCPExecutionContext } from '../mcp';
import { AiAgent, InsertSystemActivity } from '../../../shared/schema';

// Agent capability interface
export interface AgentCapability {
  name: string;
  description: string;
  parameters?: any;
  handler: (parameters: any, agent: BaseAgent) => Promise<any>;
}

// Agent configuration interface
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  permissions: string[];
}

/**
 * Base Agent class that all specialized agents will extend
 */
export abstract class BaseAgent {
  protected id: any; // Can be string or number based on implementation
  protected name: string;
  protected description: string;
  protected capabilities: Map<string, AgentCapability>;
  protected permissions: string[];
  protected storage: IStorage;
  protected mcpService: MCPService;
  protected config: AgentConfig = {} as AgentConfig;
  protected isActive: boolean = false;
  protected lastActivity: Date | null = null;
  protected performanceScore: number = 100;

  constructor(storage: IStorage, mcpService: MCPService, config: AgentConfig) {
    this.storage = storage;
    this.mcpService = mcpService;
    this.config = config;
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.permissions = config.permissions || [];
    
    // Initialize capabilities map
    this.capabilities = new Map<string, AgentCapability>();
    
    // Register capabilities
    if (config.capabilities && Array.isArray(config.capabilities)) {
      for (const capability of config.capabilities) {
        this.registerCapability(capability);
      }
    }
  }
  
  /**
   * Register MCP tools for this agent
   * 
   * Allows agents to register tools with the MCP system
   */
  protected async registerMCPTools(tools: any[]): Promise<void> {
    try {
      for (const tool of tools) {
        await this.mcpService.registerTool({
          name: tool.name,
          description: tool.description,
          requiredPermissions: ['authenticated'],
          execute: tool.handler
        });
      }
      await this.logActivity('tools_registered', `Registered ${tools.length} tools with MCP`);
    } catch (error: any) {
      console.error(`Error registering tools for agent '${this.name}':`, error);
      await this.logActivity('tools_registration_error', `Error registering tools: ${error.message}`);
    }
  }

  /**
   * Initialize agent (to be implemented by derived classes)
   */
  public abstract initialize(): Promise<void>;
  
  /**
   * Base initialization that can be called by child classes
   */
  protected async baseInitialize(): Promise<void> {
    await this.logActivity('base_initialization', 'Base agent initialization completed');
  }

  /**
   * Start the agent (set to active state)
   */
  public async start(): Promise<void> {
    this.isActive = true;
    await this.updateStatus('active', 100);
    await this.logActivity('agent_started', 'Agent started successfully');
  }

  /**
   * Stop the agent (set to inactive state)
   */
  public async stop(): Promise<void> {
    this.isActive = false;
    await this.updateStatus('inactive', this.performanceScore);
    await this.logActivity('agent_stopped', 'Agent stopped');
  }

  /**
   * Execute a capability
   */
  public async executeCapability(name: string, parameters: any): Promise<any> {
    if (!this.isActive) {
      throw new Error(`Agent '${this.name}' is not active`);
    }

    const capability = this.capabilities.get(name);
    if (!capability) {
      throw new Error(`Capability '${name}' not found in agent '${this.name}'`);
    }

    try {
      this.lastActivity = new Date();
      
      // Log capability execution
      await this.logActivity('capability_execution', `Executing capability '${name}'`, {
        capability: name,
        parameters
      });
      
      // Execute the capability
      const result = await capability.handler(parameters, this);
      
      // Update performance metrics (simplified model)
      this.performanceScore = Math.min(100, this.performanceScore + 1);
      await this.updateStatus('active', this.performanceScore);
      
      // Log successful execution
      await this.logActivity('capability_success', `Successfully executed capability '${name}'`, {
        capability: name,
        result: result
      });
      
      return {
        success: true,
        result,
        agent: this.name,
        capability: name
      };
    } catch (error) {
      // Decrease performance score on error
      this.performanceScore = Math.max(0, this.performanceScore - 5);
      await this.updateStatus('error', this.performanceScore);
      
      // Get the error message safely, handling any type of error
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log error
      await this.logActivity('capability_error', `Error executing capability '${name}': ${errorMessage}`, {
        capability: name,
        error: errorMessage
      });
      
      return {
        success: false,
        error: errorMessage,
        agent: this.name,
        capability: name
      };
    }
  }

  /**
   * Execute an MCP tool through the MCP service
   */
  public async executeMCPTool(tool: string, parameters: any): Promise<any> {
    const request: MCPRequest = {
      tool,
      parameters,
      agentId: this.id
    };
    
    const context: MCPExecutionContext = {
      agentId: this.id,
      isAuthenticated: true,
      permissions: this.permissions,
      requestId: `agent-${this.id}-${Date.now()}`,
      startTime: new Date()
    };
    
    return this.mcpService.executeTool(request, context);
  }

  /**
   * Register a new capability
   */
  protected registerCapability(capability: AgentCapability): void {
    this.capabilities.set(capability.name, capability);
  }

  /**
   * Update agent status in the database
   */
  protected async updateStatus(status: string, performance: number): Promise<void> {
    try {
      this.performanceScore = performance;
      // Check if the method exists before calling it
      if (typeof this.storage.updateAiAgentStatus === 'function') {
        await this.storage.updateAiAgentStatus(this.id, status, performance);
      } else {
        // Fallback: just log to console if the method doesn't exist
        console.log(`Agent ${this.name} status update: status=${status}, performance=${performance}`);
      }
    } catch (error) {
      console.error(`Error updating agent status for '${this.name}':`, error);
    }
  }

  /**
   * Log agent activity
   */
  protected async logActivity(
    activityType: string, 
    message: string, 
    details: any = {}
  ): Promise<void> {
    try {
      const activityData: InsertSystemActivity = {
        activity_type: activityType,
        component: `agent:${this.name}`,
        status: 'info',
        details: {
          agentId: this.id,
          agentName: this.name,
          message,
          ...details
        },
        created_at: new Date()
      };
      
      // Check if the method exists before calling it
      if (typeof this.storage.createSystemActivity === 'function') {
        await this.storage.createSystemActivity(activityData);
      } else {
        // Fallback: log to console
        console.log(`Agent ${this.name} activity: ${activityType} - ${message}`);
      }
    } catch (error) {
      console.error(`Error logging activity for agent '${this.name}':`, error);
    }
  }

  /**
   * Get available tools from MCP
   */
  protected async getAvailableMCPTools(): Promise<any[]> {
    // Safely check if the method exists
    if (typeof this.mcpService.getAvailableTools === 'function') {
      return this.mcpService.getAvailableTools(this.permissions);
    } else {
      // Fallback: return empty array if method doesn't exist
      console.log(`Agent ${this.name}: MCP getAvailableTools not available, using empty array`);
      return [];
    }
  }

  /**
   * Get agent status
   */
  public getStatus(): {
    id: number;
    name: string;
    isActive: boolean;
    lastActivity: Date | null;
    performanceScore: number;
  } {
    return {
      id: this.id,
      name: this.name,
      isActive: this.isActive,
      lastActivity: this.lastActivity,
      performanceScore: this.performanceScore
    };
  }
}