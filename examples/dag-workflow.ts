import { StateGraph } from '../src';

// 1. Define the global state dictionary that agents will pass around.
interface ReviewState extends Record<string, any> {
  topic: string;
  draft: string;
  feedback: string;
  isValid: boolean;
  revisionCount: number;
}

async function main() {
  console.log('--- NexusCore Framework Graph DAG Example ---');

  // 2. Initialize the engine with the typed State
  const graph = new StateGraph<ReviewState>();

  // 3. Define Nodes
  graph.addNode('Researcher', async (state) => {
    console.log(`[Worker: Researcher] Initiating research on: ${state.topic}`);
    // In reality, this would be an Agent calling tools. We simulate it here.
    return { draft: `This is the initial draft regarding ${state.topic}.` };
  });

  graph.addNode('Editor', async (state) => {
    console.log(`[Worker: Editor] Reviewing draft (Revision #${state.revisionCount})...`);
    
    if (state.revisionCount >= 2) {
      console.log(`[Worker: Editor] Looks good! Approving draft.`);
      return { isValid: true, feedback: 'Approved.' };
    } else {
      console.log(`[Worker: Editor] Needs more details. Rejecting.`);
      return { 
        isValid: false, 
        feedback: 'Please add more technical specifics.',
        revisionCount: state.revisionCount + 1
      };
    }
  });

  graph.addNode('Writer', async (state) => {
     console.log(`[Worker: Writer] Applying feedback: "${state.feedback}"`);
     return { draft: state.draft + ' Adding technical specifics...' };
  });

  // 4. Define Edges (The Flow execution pathways)
  graph.setEntryPoint('Researcher');
  
  // Straight linear edge
  graph.addEdge('Researcher', 'Editor');

  // Conditional Branching (A cyclical loop!)
  graph.addConditionalEdge('Editor', (state) => {
    if (state.isValid) {
      return StateGraph.END; // Route to conclusion
    } else {
      return 'Writer'; // Route backwards forming a state-machine loop
    }
  });

  // Close the cycle
  graph.addEdge('Writer', 'Editor');

  // 5. Execute Run
  console.log('\n[Orchestrator] Invoking Graph...');
  
  const initialState: ReviewState = {
    topic: 'NexusCore Graph Architecture',
    draft: '',
    feedback: '',
    isValid: false,
    revisionCount: 0
  };

  const finalState = await graph.invoke(initialState, 20);

  console.log('\n✅ Final Orchestrated Result:');
  console.log(JSON.stringify(finalState, null, 2));
}

main().catch(console.error);
