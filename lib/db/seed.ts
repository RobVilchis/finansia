import { db } from './index';
import { categories } from './schema/categories';

const seedCategories = async () => {
  try {
    const existingCategories = await db.select().from(categories);
    
    if (existingCategories.length === 0) {
      await db.insert(categories).values([
        { id: 'cat_food', name: 'Food & Groceries', description: 'Daily food and grocery expenses' },
        { id: 'cat_ent', name: 'Entertainment', description: 'Entertainment and leisure activities' },
        { id: 'cat_util', name: 'Utilities', description: 'Utility bills like electricity, water, and gas' },
        { id: 'cat_trans', name: 'Transportation', description: 'Transportation expenses including fuel and public transit' },
        { id: 'cat_dining', name: 'Dining Out', description: 'Restaurant and dining expenses' },
        { id: 'cat_health', name: 'Healthcare', description: 'Medical expenses and healthcare costs' },
        { id: 'cat_shop', name: 'Shopping', description: 'General shopping and retail purchases' },
        { id: 'cat_house', name: 'Housing', description: 'Rent, mortgage, and home maintenance' },
        { id: 'cat_edu', name: 'Education', description: 'Educational expenses and materials' },
        { id: 'cat_other', name: 'Other', description: 'Miscellaneous expenses' }
      ]);
      console.log('Categories seeded successfully!');
    } else {
      console.log('Categories already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// Run the seed
seedCategories(); 