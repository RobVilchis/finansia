import Navbar from './components/Navbar';
import ExpenseCard from './components/ExpenseCard';

const dummyExpenses = [
  {
    concept: "Grocery Shopping",
    date: "2024-03-15",
    amount: 156.78,
    category: "Food & Groceries"
  },
  {
    concept: "Netflix Subscription",
    date: "2024-03-14",
    amount: 15.99,
    category: "Entertainment"
  },
  {
    concept: "Electric Bill",
    date: "2024-03-13",
    amount: 89.50,
    category: "Utilities"
  },
  {
    concept: "Gas Station",
    date: "2024-03-12",
    amount: 45.23,
    category: "Transportation"
  },
  {
    concept: "Restaurant Dinner",
    date: "2024-03-11",
    amount: 68.90,
    category: "Dining Out"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Recent Expenses
        </h1>
        <div className="grid gap-4 max-w-2xl mx-auto">
          {dummyExpenses.map((expense, index) => (
            <ExpenseCard
              key={index}
              concept={expense.concept}
              date={expense.date}
              amount={expense.amount}
              category={expense.category}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
