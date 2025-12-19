
import { use, useEffect, useState } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [description, setDescription] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const monthlySummary = getMonthlySummary(transactions);

  useEffect(()=>{
    getTransactions().then(setTransactions)
  }, []);

  async function getTransactions(){
    const url = process.env.REACT_APP_API_URL+'/transactions';
    const response = await fetch(url);
    return await response.json();
  }




  async function saveTransaction(ev) {
    ev.preventDefault();
  
    const price = name.split(' ')[0];
    const transactionData = {
      price: Number(price),
      name: name.substring(price.length + 1),
      description,
      datetime,
    };
  
    const url = editingId
      ? process.env.REACT_APP_API_URL + '/transaction/' + editingId
      : process.env.REACT_APP_API_URL + '/transaction';
  
    const method = editingId ? 'PUT' : 'POST';
  
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    });
  
    const json = await res.json();
  
    if (editingId) {
      // update existing transaction in UI
      setTransactions(prev =>
        prev.map(t => (t._id === editingId ? json : t))
      );
    } else {
      // add new transaction
      setTransactions(prev => [...prev, json]);
    }
  
    // reset form
    setEditingId(null);
    setName('');
    setDescription('');
    setDatetime('');
  }
  

  async function deleteTransaction(id) {
    const url = process.env.REACT_APP_API_URL + '/transaction/' + id;
  
    await fetch(url, {
      method: 'DELETE',
    });
  
    
    setTransactions(prev =>
      prev.filter(transaction => transaction._id !== id)
    );
  }

  function startEditing(transaction) {
    setEditingId(transaction._id);
    setName(
      `${transaction.price > 0 ? '+' : ''}${transaction.price} ${transaction.name}`
    );
    setDescription(transaction.description);
    setDatetime(transaction.datetime.slice(0, 16)); // for datetime-local
  }
  
  function getMonthlySummary(transactions) {
    const summary = {};
  
    transactions.forEach(tx => {
      const date = new Date(tx.datetime);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
  
      if (!summary[monthKey]) {
        summary[monthKey] = {
          year: date.getFullYear(),
          month: date.getMonth(),
          income: 0,
          expense: 0,
        };
      }
  
      if (tx.price > 0) {
        summary[monthKey].income += tx.price;
      } else {
        summary[monthKey].expense += Math.abs(tx.price);
      }
    });
  
    return Object.values(summary).sort(
      (a, b) => b.year - a.year || b.month - a.month
    );
  }
  

  let balance = 0;
  for ( let transaction of transactions) {
    balance = balance + transaction.price;
  }
  balance = balance.toFixed(2);
  const fraction = balance.split('.')[1];
  balance = balance.split('.')[0];
  
  return (
    <main>
      <h1>{balance}<span>{fraction}</span></h1>
      <form onSubmit={saveTransaction}>
        <div className='basic'>
        <input type='text' value={name}  onChange={ev => setName(ev.target.value)} placeholder= {'+200 new ipad'}/>
        <input type='datetime-local' value={datetime} onChange={ev => setDatetime(ev.target.value)}/>
        </div>
        <div className = "description">
        <input type='text' value={description} onChange={ev => setDescription(ev.target.value)} placeholder={'description'}/>
        </div>
        <button type='submit'>Add new transaction</button>
      

      </form>

     


      <div className="transactions">
      {transactions.length > 0 &&
      transactions
      .slice()
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
      .map(transaction => {
        const formattedPrice =
          `${transaction.price > 0 ? '+' : ''}$${Math.abs(transaction.price)}`;

        return (
          <div className="transaction" key={transaction._id}>
            <div className="left">
              <div className="name">{transaction.name}</div>
              <div className="description">{transaction.description}</div>
            </div>
            <div className="right">
              <div className={`price ${transaction.price < 0 ? 'red' : 'green'}`}>
                {formattedPrice}
              </div>
              <div className="datetime">
                {new Date(transaction.datetime).toLocaleString()}
              </div>
              <button
                  className="delete-btn"
                  onClick={() => deleteTransaction(transaction._id)}>❌</button>
              <button onClick={() => startEditing(transaction)}>✏️</button>

            </div>
          </div>
        );
      })}
</div>

<div className="monthly-summary">
  <h2>Monthly Summary</h2>

  {monthlySummary.map(month => {
    const balance = month.income - month.expense;

    return (
      <div className="month-card" key={`${month.year}-${month.month}`}>
        <h3>
          {new Date(month.year, month.month).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>

        <div className="summary-row green">
          Income: ${month.income.toFixed(2)}
        </div>

        <div className="summary-row red">
          Expense: ${month.expense.toFixed(2)}
        </div>

        <div className="summary-row">
          Balance: ${balance.toFixed(2)}
        </div>
      </div>
    );
  })}
</div>

    </main>
  );
}

export default App;
