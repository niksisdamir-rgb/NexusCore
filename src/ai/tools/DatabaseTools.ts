import { Tool, ToolOption } from '../agents/Tool';
import { prisma } from '@/lib/db';

export const CreateRecipeTool = new Tool({
  name: 'CreateRecipe',
  description: 'Saves a newly extracted recipe to the database. Provide JSON string with name, cementAmount, waterAmount, sandAmount, gravelAmount.',
  execute: async (input: string) => {
    try {
      const data = JSON.parse(input);
      const recipe = await prisma.recipe.create({
        data: {
          name: data.name,
          cementAmount: parseFloat(data.cementAmount) || 0,
          waterAmount: parseFloat(data.waterAmount) || 0,
          sandAmount: parseFloat(data.sandAmount) || 0,
          gravelAmount: parseFloat(data.gravelAmount) || 0,
          admixtureAmount: data.admixtureAmount ? parseFloat(data.admixtureAmount) : null,
        }
      });
      return JSON.stringify({ success: true, id: recipe.id });
    } catch (err: any) {
      return JSON.stringify({ success: false, error: err.message || 'Failed to parse or create recipe' });
    }
  }
});
