import { createContext, useReducer, useEffect, useContext } from "react";

// 1️⃣ Create a Context to share state globally
const ExpenseContext = createContext();

// 2️⃣ Define the initial state of the app
const initialState = {
  expenses: JSON.parse(localStorage.getItem("expenses")) || [],       // Array to store all expense objects
  loading: false,     // Loading indicator (true/false)
  error: null,        // To store any error messages
};

// 3️⃣ Reducer function to manage state changes based on action types
const expenseReducer = (state, action) => {
  switch (action.type) {
    case "ADD_EXPENSE":
      // Add a new expense to the list
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };

    case "DELETE_EXPENSE":
      // Remove an expense by filtering it out by ID
      return {
        ...state,
        expenses: state.expenses.filter(
          (expense) => expense.id !== action.payload.id
        ),
      };

    case "UPDATE_EXPENSE":
      // Update an expense by replacing the matching one
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };

    case "SET_LOADING":
      // Set the loading state
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      // Set the error message
      return { ...state, error: action.payload };

    default:
      // If action is unknown, return state unchanged
      return state;
  }
};

// 4️⃣ Provider component that wraps the app and shares context
export const ExpenseProvider = ({ children }) => {
  // Use useReducer to manage state and dispatch actions
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // 5️⃣ Save expenses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("expenses", JSON.stringify(state.expenses));
    } catch (error) {
      console.error("Failed to save expenses to local storage: ", error);
      dispatch({ type: "SET_ERROR", payload: error });
    }
  }, [state.expenses]); // Runs whenever expenses change

  // 6️⃣ Define context value: state + dispatch functions
  const value = {
    ...state, // includes: expenses, loading, error

    // Add a new expense
    addExpense: (expense) => {
      const newExpense = {
        ...expense,
        id: crypto.randomUUID(), // generates unique ID
      };
      dispatch({ type: "ADD_EXPENSE", payload: newExpense });
    },

    // Delete an expense by ID
    deleteExpense: (id) => {
      dispatch({ type: "DELETE_EXPENSE", payload: { id } });
    },

    // Update an existing expense
    updateExpense: (expense) => {
      dispatch({ type: "UPDATE_EXPENSE", payload: expense });
    },
  };

  // 7️⃣ Return the provider with the value so any child can access it
  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

// 8️⃣ Custom hook to use the context in components
export const useExpenses = () => {
  const context = useContext(ExpenseContext);

  // Ensure the hook is used within a Provider
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }

  return context;
};
