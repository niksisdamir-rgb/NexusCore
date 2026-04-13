export type NodeFunction<TState> = (state: TState) => Promise<Partial<TState>> | Partial<TState>;

export type ConditionalEdgeFunction<TState> = (state: TState) => string;

export class StateGraph<TState extends Record<string, any>> {
  public static readonly END = '__END__';

  private nodes: Map<string, NodeFunction<TState>> = new Map();
  private edges: Map<string, string> = new Map();
  private conditionalEdges: Map<string, ConditionalEdgeFunction<TState>> = new Map();
  private entryPoint: string | null = null;

  /**
   * Registers a unique execution node to the graph.
   * @param name Name of the node.
   * @param func The logic that will receive the global state and return partial state updates.
   */
  public addNode(name: string, func: NodeFunction<TState>): void {
    if (name === StateGraph.END) {
        throw new Error(`Node name "${StateGraph.END}" is reserved.`);
    }
    this.nodes.set(name, func);
  }

  /**
   * Creates a direct, unconditional path from one node to another.
   * @param fromNode Name of the originating node.
   * @param toNode Name of the destination node (can be END).
   */
  public addEdge(fromNode: string, toNode: string): void {
    this.edges.set(fromNode, toNode);
  }

  /**
   * Creates a branching path from a node based on the evaluation of the state.
   * @param fromNode Name of the originating node.
   * @param condition Logic evaluating the state and returning the name of the next destination node.
   */
  public addConditionalEdge(fromNode: string, condition: ConditionalEdgeFunction<TState>): void {
    this.conditionalEdges.set(fromNode, condition);
  }

  /**
   * Defines where the graph begins execution.
   */
  public setEntryPoint(nodeName: string): void {
    this.entryPoint = nodeName;
  }

  /**
   * Validates the graph, looking for missing definitions.
   * (Allows cycles for recursive agents).
   */
  public compile(): void {
    if (!this.entryPoint) {
      throw new Error("Cannot compile StateGraph: No entry point defined.");
    }
    if (!this.nodes.has(this.entryPoint)) {
      throw new Error(`Cannot compile StateGraph: Entry point "${this.entryPoint}" is not a registered node.`);
    }
  }

  /**
   * Executes the state-machine.
   * @param initialState The baseline state dictionary.
   * @param recursionLimit Safeguard against infinite logic loops (default 50).
   * @returns The final assembled state state.
   */
  public async invoke(initialState: TState, recursionLimit: number = 50): Promise<TState> {
    this.compile();
    let currentState: TState = { ...initialState };
    let currentNode = this.entryPoint!;
    let iteration = 0;

    console.log(`[StateGraph] Beginning execution at -> ${currentNode}`);

    while (currentNode !== StateGraph.END && iteration < recursionLimit) {
      iteration++;
      const nodeLogic = this.nodes.get(currentNode);
      
      if (!nodeLogic) {
         throw new Error(`Execution error: Node "${currentNode}" was referenced but does not exist.`);
      }

      // 1. Execute Node Logic and merge the subset into global State
      const partialStateUpdate = await nodeLogic(currentState);
      currentState = { ...currentState, ...partialStateUpdate };

      // 2. Determine next routings
      let nextNode = StateGraph.END;

      if (this.conditionalEdges.has(currentNode)) {
         // Resolve conditional branch
         const routingFunction = this.conditionalEdges.get(currentNode)!;
         nextNode = routingFunction(currentState);
         console.log(`[StateGraph] Evaluated Condition on [${currentNode}] -> Routing to [${nextNode}]`);
      } else if (this.edges.has(currentNode)) {
         // Resolve direct edge
         nextNode = this.edges.get(currentNode)!;
         console.log(`[StateGraph] Direct Edge from [${currentNode}] -> Routing to [${nextNode}]`);
      } else {
         console.log(`[StateGraph] No outbound edges from [${currentNode}] -> Terminating at __END__`);
      }

      currentNode = nextNode;
    }

    if (iteration >= recursionLimit) {
      console.warn(`[StateGraph] Terminated early due to exceeding recursion limit (${recursionLimit}).`);
    }

    console.log(`[StateGraph] Graph execution concluded.`);
    return currentState;
  }
}
